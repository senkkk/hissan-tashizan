# ヒッサン・コレクターズ

2桁の数字同士を足し算する、繰り上がりありの筆算問題を10問クリアすると、独自キャラクターをゲットできる簡易ブラウザゲームです。
GitHub Pages でそのまま公開できる、依存関係なしの静的アプリとして構築しています。

## 遊び方

1. 画面に表示された2桁＋2桁の筆算問題を解きます。
2. 答えを入力して「こたえる」を押します。
3. 正解するとクリア数が1増えます。
4. 10問正解すると「けいさんモンスター」を1体ゲットできます。
5. 何度も挑戦して図鑑コンプリートを目指します。

## ローカルでの確認

静的ファイルのみなので、ブラウザで `index.html` を開くだけでも動作します。
ローカルサーバーで確認する場合は次のように起動できます。

```bash
python3 -m http.server 8000
```

その後、ブラウザで <http://localhost:8000> を開いてください。


## 無料アカウントで使える？

結論として、GitHub Free でも **公開リポジトリ** なら GitHub Pages で公開できます。
一方、**非公開リポジトリのまま GitHub Pages で公開するには GitHub Pro / Team などの有料プランが必要**です。

このアプリは HTML/CSS/JavaScript だけで動く静的アプリなので、GitHub Pages を使わない場合でも `index.html` をブラウザで直接開けば遊べます。
ただし、友だちや家族に URL を共有したい場合は、リポジトリを公開して GitHub Pages を有効化するのが一番かんたんです。

## GitHub Pages で公開する方法

このリポジトリには GitHub Actions 用のデプロイ設定（`.github/workflows/pages.yml`）を入れてあります。
`actions/deploy-pages` を使う場合、Pages の公開元をブランチではなく **GitHub Actions** にする必要があります。

1. GitHub のリポジトリ画面で **Settings** を開きます。
2. **Pages** を選びます。
3. **Build and deployment** の Source を **GitHub Actions** にします。
4. **Actions** タブで **Deploy static site to GitHub Pages** を開き、必要なら **Run workflow** を押します。
5. 反映後に表示される GitHub Pages の URL へアクセスするとゲームを遊べます。

### デプロイエラーになったとき

`Getting Pages deployment status failed` / `HttpError: Not Found` が出る場合は、まず次を確認してください。

- **Settings > Pages > Build and deployment > Source** が **GitHub Actions** になっている。
- GitHub Free の場合は、リポジトリが **Public** になっている。Private の GitHub Pages 公開には有料プランが必要です。
- **Settings > Actions > General > Workflow permissions** で、Actions が実行できる設定になっている。
- 初回設定直後は、Pages の設定を保存してから Actions を再実行する。
