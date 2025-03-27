import "./index.css";
import { useSearchParams } from "@ice/runtime";

const urlList = [
  "https://qupbvle53j.feishu.cn/docx/KStWdWlyLoCkS0xBDYBcl1a5neb?from=from_copylink",
  "https://mj4x7dwhgk.feishu.cn/docx/NrfidcUCSoEADLxpE4scm5Ecn6f?from=from_copylink",
  "https://mj4x7dwhgk.feishu.cn/docx/CSZYd1bspoqDVpxQnXQcgvyQnme?from=from_copylink",
];

export default function HelpCenter() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id") || 0;
  const url = urlList[Number(id)];

  return (
    <div className="helpBox">
      <iframe src={url}></iframe>
    </div>
  );
}
