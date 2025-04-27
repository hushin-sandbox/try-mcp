import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNamedType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLUnionType,
  printSchema,
} from "npm:graphql";
import { SchemaTraverseError } from "./types.ts";

/**
 * GraphQLスキーマトラバーサー
 */
export class SchemaTraverser {
  private visitedTypes = new Set<string>();

  /**
   * 指定されたtype名から到達可能な型を全て収集
   * @param schema GraphQLスキーマ
   * @param typeName 開始点となるtype名
   * @returns 収集された型の集合
   * @throws SchemaTraverseError トラバースに失敗した場合
   */
  traverseFromType(
    schema: GraphQLSchema,
    typeName: string,
  ): Set<GraphQLNamedType> {
    const typeMap = schema.getTypeMap();
    const startType = typeMap[typeName];

    if (!startType) {
      throw new SchemaTraverseError(`Type '${typeName}' not found in schema`);
    }

    const collectedTypes = new Set<GraphQLNamedType>();
    this.visitedTypes.clear();
    this.collectReachableTypes(startType, collectedTypes);

    return collectedTypes;
  }

  /**
   * 収集された型をSDL形式で出力
   * @param types 収集された型の集合
   * @returns SDL形式のスキーマ定義
   */
  generateSDL(types: Set<GraphQLNamedType>): string {
    // 型定義のみを含む新しいスキーマを構築
    const typeMap: { [key: string]: GraphQLNamedType } = {};
    for (const type of types) {
      typeMap[type.name] = type;
    }

    const schemaConfig = {
      types: Array.from(types),
    };

    const schema = new GraphQLSchema(schemaConfig);
    return printSchema(schema);
  }

  /**
   * 型から到達可能な全ての型を再帰的に収集
   */
  private collectReachableTypes(
    type: GraphQLNamedType,
    collectedTypes: Set<GraphQLNamedType>,
  ): void {
    const typeName = type.name;

    // 既に訪問済みの型はスキップ
    if (this.visitedTypes.has(typeName)) {
      return;
    }
    this.visitedTypes.add(typeName);

    // 型を収集
    collectedTypes.add(type);

    // 型の種類に応じて再帰的に関連する型を収集
    if (type instanceof GraphQLObjectType) {
      this.collectFromFields(type.getFields(), collectedTypes);
    } else if (type instanceof GraphQLInterfaceType) {
      this.collectFromFields(type.getFields(), collectedTypes);
    } else if (type instanceof GraphQLUnionType) {
      for (const unionType of type.getTypes()) {
        this.collectReachableTypes(unionType, collectedTypes);
      }
    } else if (type instanceof GraphQLInputObjectType) {
      const fields = type.getFields();
      for (const field of Object.values(fields)) {
        this.collectFromInputType(field.type, collectedTypes);
      }
    } else if (type instanceof GraphQLEnumType) {
      // Enumは追加のトラバースは不要
      collectedTypes.add(type);
    }
  }

  /**
   * フィールドから到達可能な型を収集
   */
  private collectFromFields(
    fields: { [key: string]: { type: unknown } },
    collectedTypes: Set<GraphQLNamedType>,
  ): void {
    for (const field of Object.values(fields)) {
      this.collectFromOutputType(field.type, collectedTypes);
    }
  }

  /**
   * 出力型から到達可能な型を収集
   */
  private collectFromOutputType(
    type: unknown,
    collectedTypes: Set<GraphQLNamedType>,
  ): void {
    if (type instanceof GraphQLNonNull || type instanceof GraphQLList) {
      this.collectFromOutputType(type.ofType, collectedTypes);
    } else if (
      type instanceof GraphQLObjectType ||
      type instanceof GraphQLInterfaceType ||
      type instanceof GraphQLUnionType ||
      type instanceof GraphQLEnumType
    ) {
      this.collectReachableTypes(type, collectedTypes);
    }
  }

  /**
   * 入力型から到達可能な型を収集
   */
  private collectFromInputType(
    type: unknown,
    collectedTypes: Set<GraphQLNamedType>,
  ): void {
    if (type instanceof GraphQLNonNull || type instanceof GraphQLList) {
      this.collectFromInputType(type.ofType, collectedTypes);
    } else if (
      type instanceof GraphQLInputObjectType ||
      type instanceof GraphQLEnumType
    ) {
      this.collectReachableTypes(type, collectedTypes);
    }
  }
}
