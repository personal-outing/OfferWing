import { Meta, Title, Links, Main, Scripts } from "ice";

export default function Document() {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta
          property="og:site_name"
          content="OfferWing AI- 面试神器|辅助面试|面试助手|面试助攻，面试辅助工具_OfferWing AI"
        />
        <meta
          name="description"
          content="OfferWing AI-不用准备也能拿Offer！GPT4，面试辅助，面试助攻，远程面试，面试助手，大厂面经，高薪，面试经验，offer，leetcode，力扣，前端，后端，算法，编程，java，c/c++，python，golang，javascript，人工智能"
        />
        <meta
          name="keywords"
          content="OfferWing AI-GPT4，面试辅助，面试助攻，远程面试，面试助手，大厂面经，高薪，面试经验，offer，leetcode，力扣，前端，后端，算法，编程，java，c/c++，python，golang，javascript，人工智能"
        />
        <meta
          name="og:title"
          content="OfferWing AI- 面试神器|辅助面试|面试助手|面试助攻，面试辅助工具_OfferWing AI"
        />
        <meta
          name="og:description"
          content="OfferWing-不用准备也能拿Offer！GPT4，面试辅助，面试助攻，远程面试，面试助手，大厂面经，高薪，面试经验，offer，leetcode，力扣，前端，后端，算法，编程，java，c/c++，python，golang，javascript，人工智能"
        />
        <link rel="canonical" href="https://offerwing.cn" />
        <link
          rel="icon"
          href="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/favicon.ico"
        />
        <meta
          name="viewport"
          content="width=device-width, viewport-fit=cover, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
        />
        <link
          rel="stylesheet"
          href="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/tac.css"
        />
        <Meta />
        <Title />
        <Links />
        <script
          type="text/javascript"
          src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/load.min.js"
        />
        <script
          type="text/javascript"
          src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/tac.min.js"
        />
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-FXW2156BCF"
        ></script>
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-FXW2156BCF');
            `,
          }}
        ></script>
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f)})(window,document,'script','dataLayer','GTM-M87CQBJ3');
            `,
          }}
        ></script>
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
            function getUrlParams(url) {
              const searchParams = new URLSearchParams(url.split('?')[1]);
              const params = {};
              
              for (const [key, value] of searchParams.entries()) {
                params[key] = value;
              }
              
              return params;
            }
            const allParams = getUrlParams(window.location.href);
            const curSource = allParams['source'] || "default";
            // fetch("https://ipinfo.io/json?token=dceb2af9194ad0").then(
            //   (response) => response.json()
            // ).then(
            //   (jsonResponse) => {
            //     if (jsonResponse?.country !== 'CN') {
            //       window.location.href = 'https://offerwing.cn?source=' + curSource;
            //     }
            //   }
            // )
            `,
          }}
        ></script>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              body {
                width: 100%;
                height: 100%;
                background: url("https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/logo.png");
                background-repeat: no-repeat;
                background-position: center 200px;
                background-size: 100px 100px;
              }
            `,
          }}
        ></style>
      </head>
      <body>
        <Main />
        <Scripts />
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-M87CQBJ3"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
            document.addEventListener('plusready', () => {
              let firstBackTime = null;
              plus.key.addEventListener('backbutton', () => {
                const webview = plus.webview.currentWebview();
                webview.canBack(({ canBack }) => {
                  if (canBack) {
                    webview.back(); // 返回上一页
                  } else {
                    if (sessionStorage.getItem("isHome") === "1") { 
                      // 首页时提示双击退出
                      if (!firstBackTime || Date.now() - firstBackTime > 1000) {
                        firstBackTime = Date.now();
                        plus.nativeUI.toast("再按一次退出应用");
                      } else {
                        plus.runtime.quit();
                      }
                    }
                  }
                });
              });
            });
            `,
          }}
        ></script>
      </body>
    </html>
  );
}
