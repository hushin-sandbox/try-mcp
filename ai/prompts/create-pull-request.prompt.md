今回の作業のコミット履歴を `git log main..HEAD | cat` で確認してください。
今回の作業を振り返り Pull Request の本文を簡潔にまとめて `ai-out/pr/(yyyy-MM-dd)-(branch).md` に作ってください。

あなたがファイル作成後、私が本文用のファイルを確認して編集、保存します。

下記のコマンド で Pull Request を作成してください。

```
gh pr create --title "title" --body "$(cat filename)" && gh pr view --web
```
