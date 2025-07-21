# Page snapshot

```yaml
- banner:
  - button
  - heading "2025年度 3年前期" [level=1]
  - text: 合計 0単位
  - button
- main:
  - heading "授業検索" [level=2]
  - textbox "科目名、教員名、クラス名で検索...": 数学
  - button
  - button "フィルター 3"
  - button "検索"
  - text: 曜日
  - combobox: 月曜日
  - text: 時限
  - combobox: 1限
  - text: 学期
  - combobox: 前学期
  - text: 対象学科
  - combobox: 国際教養学科
  - button "フィルターをクリア"
  - heading "授業が見つかりません" [level=3]
  - paragraph: 検索条件を変更してお試しください。
- contentinfo:
  - button
  - button
  - button
  - button
- region "Notifications alt+T":
  - list:
    - listitem:
      - button "Close toast":
        - img
      - img
      - text: 0件の授業が見つかりました
- alert
- iframe
```