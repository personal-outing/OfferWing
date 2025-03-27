import React, { useCallback } from "react";
import styles from "./index.module.css";
import Markdown from "react-markdown";
import { atomDark as codeStyle } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { Modal } from "antd";

const ExpDetailModal = (props) => {
  const { open, onCancel, curShowData, onOk } = props;
  const { question, answer, questionId } = curShowData;

  return (
    <Modal width={1000} open={open} onCancel={onCancel} onOk={onOk} okText="复制问题和答案">
      <div key={`${questionId}-${Date.now()}`}>
        <div className={styles.talkContainer}>
          <div className={styles.head} style={{ backgroundColor: "#fd9f32" }}>
            问
          </div>
          <div
            className={styles.content}
            style={{
              order: 0,
              textIndent: 0,
            }}
          >
            <p style={{ marginBottom: 0 }}>
              <span
                style={{
                  fontSize: "14px",
                  color: "black",
                }}
              >
                {question}
              </span>
            </p>
          </div>
        </div>
        <div className={styles.talkContainer}>
          <div className={styles.head} style={{ backgroundColor: "#1d9bfb" }}>
            AI
          </div>
          <div
            className={styles.ansContent}
            style={{
              order: -1,
            }}
          >
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
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ExpDetailModal;
