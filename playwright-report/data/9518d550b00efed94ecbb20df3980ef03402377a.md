# Page snapshot

```yaml
- alert
- text: アカウントにログイン
- paragraph:
  - text: アカウントをお持ちでないですか？
  - button "サインアップ"
- alert: メールアドレスまたはパスワードが間違っています。
- button:
  - img
- button
- paragraph: または
- text: メールアドレス
- textbox "メールアドレス": test@example.com
- text: パスワード
- textbox "パスワード": password123
- button
- button "ログイン"
- button "パスワードを忘れた場合"
- iframe
```