import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark as codeStyle } from "react-syntax-highlighter/dist/cjs/styles/prism";

const MarkdownComponent = ({ answer }) => {
  return (
    <Markdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <SyntaxHighlighter
              {...props}
              wrapLongLines
              children={String(children).replace(/\n$/, "")}
              style={codeStyle}
              language={match[1]}
              PreTag="div"
            />
          ) : (
            <code {...props} className={className}>
              {children}
            </code>
          );
        },
      }}
    >
      {answer || "答案等待中..."}
    </Markdown>
  );
};

export default MarkdownComponent;
