# Page snapshot

```yaml
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
- textbox "メールアドレス": invalid@example.com
- text: パスワード
- textbox "パスワード": wrongpassword
- button
- button "ログイン"
- button "パスワードを忘れた場合"
- region "Notifications alt+T"
- alert
- iframe
```