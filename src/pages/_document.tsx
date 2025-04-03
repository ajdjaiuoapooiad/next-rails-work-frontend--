import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ja">
      <Head>
        <link rel="icon" href="/images/logo2.svg" />
        <title>インターンシップマッチングアプリ</title> {/* 共通のタイトルを設定 */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
