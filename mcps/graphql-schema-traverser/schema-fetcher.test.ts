import { expect } from "@std/expect";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { Stub, stub } from "@std/testing/mock";
import { buildSchema, getIntrospectionQuery, graphql } from "npm:graphql";
import { fetchSchema } from "./schema-fetcher.ts";

describe("Schema Fetcher", () => {
  let fetchStub: Stub<
    typeof globalThis,
    Parameters<typeof fetch>,
    ReturnType<typeof fetch>
  >;
  let fetchCallCount = 0;

  beforeEach(async () => {
    fetchCallCount = 0;
    const mockSchema = buildSchema(`
      type Query {
        user: User
      }

      type User {
        id: ID!
        name: String!
      }
    `);
    const schemaResult = await graphql({
      schema: mockSchema,
      source: getIntrospectionQuery(),
    });

    fetchStub = stub(globalThis, "fetch", async () => {
      fetchCallCount++;
      return new Response(
        JSON.stringify(schemaResult),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    });
  });

  afterEach(() => {
    fetchStub.restore();
  });

  it("2回目以降は同じエンドポイントに対してキャッシュを使用する", async () => {
    const endpoint = "http://example.com/graphql";

    // 1回目の呼び出し
    const schema1 = await fetchSchema({ endpoint });
    expect(fetchCallCount).toBe(1);

    // 2回目の呼び出し
    const schema2 = await fetchSchema({ endpoint });
    expect(fetchCallCount).toBe(1); // fetchは1回目のみ
    expect(schema2).toBe(schema1); // 同じインスタンスが返される
  });

  it("異なるエンドポイントは別々にキャッシュされる", async () => {
    const endpoint1 = "http://example1.com/graphql";
    const endpoint2 = "http://example2.com/graphql";

    // endpoint1の1回目
    await fetchSchema({ endpoint: endpoint1 });
    expect(fetchCallCount).toBe(1);

    // endpoint2の1回目
    await fetchSchema({ endpoint: endpoint2 });
    expect(fetchCallCount).toBe(2);

    // endpoint1の2回目
    await fetchSchema({ endpoint: endpoint1 });
    expect(fetchCallCount).toBe(2); // 変化なし

    // endpoint2の2回目
    await fetchSchema({ endpoint: endpoint2 });
    expect(fetchCallCount).toBe(2); // 変化なし
  });

  it("エラー時にはキャッシュされない", async () => {
    const endpoint = "http://example3.com/graphql";

    // エラーを返すようにスタブを変更
    fetchStub.restore();
    fetchStub = stub(globalThis, "fetch", async () => {
      fetchCallCount++;
      return new Response(
        JSON.stringify({ errors: [{ message: "Test Error" }] }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    });

    // 1回目の呼び出し (エラー)
    await expect(fetchSchema({ endpoint })).rejects.toThrow();
    expect(fetchCallCount).toBe(1);

    // 2回目の呼び出し
    await expect(fetchSchema({ endpoint })).rejects.toThrow();
    expect(fetchCallCount).toBe(2); // エラー時はキャッシュされないので再度フェッチ
  });
});
