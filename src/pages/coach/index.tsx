import store from "../../store";
import { useEffect, useRef, useState } from "react";
import GroupModal from "../../components/GroupModal";
import useScrollToBottomHook from "../../hooks/useScrollToBottomHook";
import "./index.css";
import moment, { duration } from "moment";
import { getAllCompanies, getMjInterviewStatus } from "@/services/exp";
import { getInterviewHistory, sendLog } from "@/services/meeting";
import { formatSeconds, toUrl } from "@/utils";
import { definePageConfig, useSearchParams } from "ice";
import { Button, Form, Input, Steps, Table, message } from "antd";
import { render } from "react-dom";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import React from "react";

const back = ["#95e1d3", "#cadefc", "#fce38a", "#fcbad3"];
const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 4,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 20,
    },
  },
};
const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 20,
      offset: 4,
    },
  },
};

export default function Resume() {
  const [current, setCurrent] = useState(0);
  const [allCompany, setAllCompany] = useState([]);
  const [hasUpload, setHasUpload] = useState(false);
  // const [curCompany, setCurCompany] = useState("");

  const next = () => {
    setCurrent(current + 1);
  };
  const prev = () => {
    setCurrent(current - 1);
  };
  const contentStyle = {
    marginTop: 16,
  };

  const queryAllCompanies = () => {
    getAllCompanies({}).then((res) => {
      if (res.status) {
        setAllCompany(res.data);
      }
    });
  };

  const steps = [
    {
      title: "上传简历",
      content: (
        <div>
          {!hasUpload ? (
            <div
              style={{
                border: "1px solid #ddd",
                fontSize: "22px",
                cursor: "pointer",
                height: "240px",
                lineHeight: "240px",
                textAlign: "center",
              }}
              onClick={() => {
                message.loading("上传中...");
                setTimeout(() => {
                  setHasUpload(true);
                }, 2000);
              }}
            >
              +
            </div>
          ) : (
            <embed
              src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/%E9%98%BF%E9%87%8C.pdf"
              type="application/pdf"
              width="100%"
              height="800px"
            />
          )}
        </div>
      ),
    },
    {
      title: "选择公司",
      content: (
        <div>
          <div className="allCompany">
            {allCompany.map((item, idx) => {
              return (
                <p
                  key={item.id}
                  style={{
                    background: back[idx % 4],
                    height: "100px",
                    lineHeight: "100px",
                    fontSize: "24px",
                    color: "#000",
                    cursor: "pointer",
                  }}
                  onClick={next}
                >
                  {item.companyName}
                </p>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      title: "模拟面试",
      content: (
        <div className="mockMeeting">
          <p style={{ fontWeight: "bold", fontSize: "20px" }}>
            当前公司：字节跳动
          </p>
          <div className="questionBox">
            {[
              {
                gmtModified: "2024-07-10T07:28:53.000+00:00",
                companyId: -1,
                questionId: "8034973f-1cc3-4c84-ab5f-0f5f94ad3198",
                question: "你了解哪些机器学习算法，除了实习中用到的？",
                answer:
                  "**快速回答**  啊，除了实习中用过的那些算法，我还学过像决策树、随机森林这些常见的机器学习算法，还有像神经网络和深度学习也有一些了解。\n\n**详细回答**  \n在实习之外，我还学习和使用过以下几种算法：\n- **决策树**：用于分类和回归任务，具有良好的解释性。\n- **随机森林**：通过集成多个决策树提高模型的准确性和稳定性。\n- **支持向量机（SVM）**：在分类任务中表现优秀，特别是在高维空间中。\n- **神经网络和深度学习**：包括卷积神经网络（CNN）和循环神经网络（RNN），用于图像和时间序列数据处理。\n- **K均值聚类**：用于无监督学习任务中的数据聚类。",
                positionId: 12,
                interviewCnt: 4,
                gmtCreate: "2024-07-10T07:28:53.000+00:00",
              },
              {
                gmtModified: "2024-07-10T07:56:23.000+00:00",
                companyId: -1,
                questionId: "c1e830a5-0725-4e7c-b2c9-22b9af9e897c",
                question: "你希望实现的功能是什么？",
                answer: "**面试者:**\n\n好的，请问您希望我实现什么功能的代码？",
                positionId: 12,
                interviewCnt: 4,
                gmtCreate: "2024-07-10T07:56:23.000+00:00",
              },
              {
                gmtModified: "2024-07-10T07:56:41.000+00:00",
                companyId: -1,
                questionId: "88d0dfde-cfb1-42f3-ab56-43c48a415e68",
                question:
                  "你们处理的是蛋白质结构预测，如何使用图神经网络进行分析的？",
                answer:
                  "**我们处理的是蛋白质结构预测，其中涉及抗原和抗体的结合。我们将蛋白质结构转换为无向图并使用图神经网络进行分析。通过试图注意力机制，我们判断氨基酸之间的结合可能性并对特定位点进行聚合。**",
                positionId: 12,
                interviewCnt: 4,
                gmtCreate: "2024-07-10T07:56:41.000+00:00",
              },
              {
                gmtModified: "2024-07-10T07:24:37.000+00:00",
                companyId: -1,
                questionId: "ade128ed-1ef7-4358-8d73-1304bc2b7fe0",
                question:
                  "你能简要解释一下为什么在将0~100的得分转换到0~1之间时需要根据标签分布情况进行调整吗？",
                answer:
                  "**快速回答** 哦，还没完呢。这个得分不是直接除以100，而是根据标签分布情况有一些调整，主要是为了更好地反映极端情况。\n\n**详细回答** \n哦，还没完呢。对于0~100的得分转到0~1之间，不是简单地除以100，而是根据标签分布情况进行调整。这样做是为了更好地区分极端情况，提高模型的准确性。",
                positionId: 12,
                interviewCnt: 3,
                gmtCreate: "2024-07-10T07:24:37.000+00:00",
              },
              {
                gmtModified: "2024-07-10T07:25:38.000+00:00",
                companyId: -1,
                questionId: "dabf2678-a239-41d2-b1e2-7fd2d9331d3a",
                question: "你如何处理一个部分有序或无序的数组？",
                answer:
                  "**快速回答** 嗯，要是数组不是完全有序的呢，可以考虑使用分块排序或者其他数据结构来辅助，比如哈希表或者平衡树。\n\n**详细回答** 如果数组部分有序或无序，可以使用**分块排序**，将数组分成小块分别排序并存储索引；或者使用**哈希表**来记录元素出现的位置，甚至使用**平衡树**来维护动态有序性，从而进行高效查找。这样能够有效放宽原数组必须有序的严格条件。",
                positionId: 12,
                interviewCnt: 3,
                gmtCreate: "2024-07-10T07:25:38.000+00:00",
              },
              {
                gmtModified: "2024-07-10T07:25:56.000+00:00",
                companyId: -1,
                questionId: "cb3094a4-c6ea-478d-b608-7abe22d10518",
                question: "你最擅长的算法和数据结构方面的题目是哪些？",
                answer:
                  "**快速回答** 嗯，好的，我理解了。我主要准备的是算法和数据结构方面的内容，比如二叉树、动态规划和图论等。也刷了不少LeetCode的题。\n\n**详细回答**\n我主要准备的是**算法和数据结构**方面的内容，特别是**二叉树、动态规划、图论**等常见题型。我在LeetCode上刷了大概300道题，覆盖了这些领域的中等难度题目。同时，我也关注了一些实际应用，比如在风控领域的算法应用。",
                positionId: 12,
                interviewCnt: 3,
                gmtCreate: "2024-07-10T07:25:56.000+00:00",
              },
              {
                gmtModified: "2024-07-10T07:26:09.000+00:00",
                companyId: -1,
                questionId: "02885abf-8911-4d32-9a2f-bb67e743b4ca",
                question: "你在项目中用到的传统经典方法是哪些？",
                answer:
                  "**快速回答** 嗯，有的，我平时在项目中会经常用到一些传统的经典方法，比如标准化、归一化和分箱等操作，来处理连续值特征。具体看场景需要。\n\n**详细回答** \n嗯，有的。在处理连续值特征时，我通常会用到一些经典的预处理方法，比如：\n- **标准化**：将特征值调整到均值为0，方差为1。\n- **归一化**：将特征值缩放到一个特定的范围（如0到1）。\n- **分箱**：将连续特征值划分为多个区间，转化为离散值。\n\n这些方法在提高模型性能和训练效率方面都很有效。",
                positionId: 12,
                interviewCnt: 3,
                gmtCreate: "2024-07-10T07:26:09.000+00:00",
              },
              {
                gmtModified: "2024-07-10T07:26:14.000+00:00",
                companyId: -1,
                questionId: "214dfbb0-0c2c-4788-873c-b0ed021b3be0",
                question:
                  "现在你对处理问题时使用多个准则来寻找最优解有什么想法吗？",
                answer:
                  "**快速回答** 其实处理很多问题时我们确实会用到多个准则，最优的解决方案通常是通过平衡这些准则来达到的。比如在逻辑回归中，我们会考虑正则化、特征选择等因素来优化模型。\n\n**详细回答** 处理问题时，我们会使用多个准则来寻找最优解。在逻辑回归中，通常会考虑以下几个方面：\n\n1. **正则化**：通过L1或L2正则化防止过拟合。\n2. **特征选择**：选择对模型有贡献的特征，减少计算复杂度。\n3. **标准化**：对连续特征进行标准化以加速收敛。\n\n这些方法协同使用，可以帮助我们在不同准则间找到平衡，达到最优的解决方案。",
                positionId: 12,
                interviewCnt: 3,
                gmtCreate: "2024-07-10T07:26:14.000+00:00",
              },
              {
                gmtModified: "2024-07-10T07:29:12.000+00:00",
                companyId: -1,
                questionId: "807b3a37-9c2b-4fa7-a756-4ce3a6d25ccf",
                question: "请问，短期反转投资组合的关键在于什么？",
                answer:
                  "**快速回答** 呃，短期反转投资组合的关键在于利用股票的短期波动来获利。具体来说，可以根据上一个月的涨跌幅来调整投资组合。\n\n**详细回答** \n短期反转投资组合策略基于股票价格的短期波动，意图在短期内从价格的反转中获利。一个常见的做法是**根据上个月的股票涨跌幅**来选择投资标的。具体步骤如下：\n\n1. **数据收集**：收集过去一个月的股票价格数据。\n2. **计算涨跌幅**：计算每只股票在过去一个月中的涨跌幅。\n3. **选股**：选择涨跌幅最大的股票，假设这些股票在下个月可能会反转。\n4. **构建组合**：根据选定股票构建投资组合。\n5. **定期调整**：每月末重新计算并调整投资组合。\n\n这种策略利用的是**均值回归**的原理，假设股票价格会回归其平均值。",
                positionId: 12,
                interviewCnt: 3,
                gmtCreate: "2024-07-10T07:29:12.000+00:00",
              },
              {
                gmtModified: "2024-07-10T07:56:48.000+00:00",
                companyId: -1,
                questionId: "cc664da4-a4b1-4f77-8974-e83a9760167a",
                question:
                  "请问你在项目中使用了哪些具体的机器学习算法来处理数据？",
                answer:
                  "好的，我来介绍一下我们团队最近完成的一个项目，叫做“水分检测项目”。\n\n**背景**：该项目旨在开发一种高精度的水分检测系统，该系统能够在各种环境条件下对样品的水分含量进行实时监控。主要应用领域包括农业、食品加工和制药行业。\n\n**具体工作**：\n1. **数据采集**：我们使用高灵敏度的传感器收集样品的水分数据。\n2. **数据处理**：通过机器学习算法对收集到的数据进行分析和处理，确保检测结果的准确性和稳定性。\n3. **系统集成**：将数据处理模块与用户界面集成，用户可以通过界面实时查看和分析检测结果。\n4. **测试与优化**：在不同环境条件下进行了大量的测试，并根据测试结果不断优化算法和传感器的性能。\n\n**项目结果**：\n该系统成功地提高了水分检测的精度和效率，受到了客户的广泛好评，并且已经在多个行业中得到了应用。",
                positionId: 12,
                interviewCnt: 3,
                gmtCreate: "2024-07-10T07:56:48.000+00:00",
              },
              {
                gmtModified: "2024-07-10T08:49:50.000+00:00",
                companyId: -1,
                questionId: "098e0cc7-e216-4730-9dbd-7aba94303720",
                question: "你对CNN、LSTM和Transformer有哪些了解？",
                answer:
                  "**面试者:**\n我比较熟悉 **CNN（卷积神经网络）** 和 **LSTM（长短期记忆网络）**。CNN 通常用于图像处理任务，比如图像分类和检测。LSTM 则适用于处理序列数据，比如自然语言处理和时间序列预测。此外，我还了解 **Transformer** 模型，主要应用于自然语言处理领域，比如机器翻译和文本生成。",
                positionId: 12,
                interviewCnt: 3,
                gmtCreate: "2024-07-10T08:49:50.000+00:00",
              },
              {
                gmtModified: "2024-07-10T10:40:05.000+00:00",
                companyId: -1,
                questionId: "1fda97ac-5166-4b83-bc6d-1bc1b1839ef1",
                question: "这种分层建模的方法有哪些优势？",
                answer:
                  "**面试者:**\n\n我们可以采用一种**分层建模**的方式来处理不同年龄段的血压预测问题。具体步骤如下：\n\n1. **数据分组**：首先将数据按照不同的年龄段进行分组，例如0-10岁、10-20岁、20-30岁等。\n2. **单独训练模型**：针对每个年龄段的数据单独训练模型，这样可以捕捉不同年龄段的特征。\n3. **模型集成**：训练完成后，对于新的输入数据，根据年龄选择对应的模型进行预测。\n\n这种方法可以提高模型的**准确性**，因为不同年龄段的血压特征可能存在显著差异。\n\n```python\n# 伪代码示例\nmodels = {}\nfor age_group in age_groups:\n    data_subset = data[data['age_group'] == age_group]\n    model = train_model(data_subset)\n    models[age_group] = model\n\ndef predict(input_data):\n    age_group = determine_age_group(input_data['age'])\n    return models[age_group].predict(input_data)\n```",
                positionId: 12,
                interviewCnt: 3,
                gmtCreate: "2024-07-10T10:40:05.000+00:00",
              },
              {
                gmtModified: "2024-07-10T07:23:47.000+00:00",
                companyId: -1,
                questionId: "312e5825-f4a0-4340-92d4-9145f02dfff4",
                question: "你为什么没有选择在投资领域工作？",
                answer:
                  "**快速回答** 嗯，其实我没有选择投资领域主要有两个原因：一是我更喜欢技术研发的工作，二是投资领域的工作时间和生活平衡对我来说有点难接受。\n\n**详细回答** \n其实我没有选择进入投资领域主要有两个原因：\n\n1. **个人兴趣**：我更喜欢技术研发的工作，尤其是在算法和数据分析方面，这些工作让我感觉更加有成就感。\n2. **生活平衡**：投资领域的工作时间往往比较长，对生活和健康的影响较大。而我更注重工作和生活的平衡，喜欢保持一个相对健康的生活方式。",
                positionId: 12,
                interviewCnt: 2,
                gmtCreate: "2024-07-10T07:23:47.000+00:00",
              },
              {
                gmtModified: "2024-07-10T07:23:59.000+00:00",
                companyId: -1,
                questionId: "8e1278ea-593f-44e2-9261-ea3f592c502b",
                question: "新工作中，你更希望挑战集中在哪个方面？",
                answer:
                  "**快速回答** 好的，我觉得对于新工作来说，我更希望挑战能够集中在技术创新和实际应用上。虽然业务知识也很重要，但我更喜欢解决复杂的技术问题，并看到我的解决方案在实际中产生效果。\n\n**详细回答** \n我希望在新工作中，挑战主要集中在**技术创新和实际应用**方面。我喜欢解决复杂的技术问题，并看到我的解决方案在实际中产生效果。虽然业务知识也很重要，但我还是更倾向于技术层面的深度探索和实践。",
                positionId: 12,
                interviewCnt: 2,
                gmtCreate: "2024-07-10T07:23:59.000+00:00",
              },
              {
                gmtModified: "2024-07-10T07:24:27.000+00:00",
                companyId: -1,
                questionId: "3aef9c63-51b6-42c0-9606-90f444ee5c06",
                question: "Swin Transformer 是用于哪些任务的模型？",
                answer:
                  "**快速回答** 啊，抱歉，我刚说的模型是Swin Transformer，这是一个基于视觉变换器的模型，用于图像分类和检测任务。\n\n**详细回答** \n刚才提到的模型是**Swin Transformer**，它是一种基于视觉变换器的模型，常用于**图像分类**和**检测任务**。这个模型通过滑动窗口机制，实现了更高效的图像特征提取，并且具有较强的泛化能力。",
                positionId: 12,
                interviewCnt: 2,
                gmtCreate: "2024-07-10T07:24:27.000+00:00",
              },
              {
                gmtModified: "2024-07-10T07:24:50.000+00:00",
                companyId: -1,
                questionId: "70695a35-d2c0-430f-aa1e-4dd945b09fdd",
                question:
                  "你在金融风险管理项目中使用的深度学习模型是基于什么算法原理的？",
                answer:
                  "**快速回答** 啊好的，我之前在一个金融风险管理项目中使用过这个模型。这个项目的背景是为了优化信贷评估流程，我主要负责模型的开发和优化。具体来说，我在这个项目中运用了深度学习算法来提高预测的准确性。\n\n**详细回答** \n在我参与的金融风险管理项目中，我使用了深度学习模型来优化信贷评估流程。项目的背景是为了提高信贷审批的准确性和速度，降低风险。我的主要工作包括以下几点：\n- **模型开发**：使用Python和TensorFlow构建深度学习模型。\n- **数据处理**：对信贷数据进行预处理和特征工程。\n- **模型优化**：通过超参数调优和交叉验证来提高模型的预测准确性。\n- **结果评估**：使用混淆矩阵和ROC曲线等指标评估模型表现。",
                positionId: 12,
                interviewCnt: 2,
                gmtCreate: "2024-07-10T07:24:50.000+00:00",
              },
              {
                gmtModified: "2024-07-10T07:25:17.000+00:00",
                companyId: -1,
                questionId: "b3607e53-2ed8-45c1-b0e9-c610c20ffc0f",
                question:
                  "团队的工作流程和主要用到的技术栈是什么？团队通常是如何分配任务的？",
                answer:
                  "**快速回答** 嗯，我之前了解了一些你们的职位信息，但还有些细节想确认一下，比如说团队的工作流程和主要用到的技术栈，能详细说一下吗？\n\n**详细回答** 嗯，我之前了解了一些你们的职位信息，但还有些细节想确认一下。能不能详细谈谈团队的工作流程和主要用到的技术栈？另外，团队通常是如何分配任务的？谢谢！",
                positionId: 12,
                interviewCnt: 2,
                gmtCreate: "2024-07-10T07:25:17.000+00:00",
              },
              {
                gmtModified: "2024-07-10T07:25:31.000+00:00",
                companyId: -1,
                questionId: "3138a720-8e06-440f-b016-c3ec411472a5",
                question: "拍摄里面多线程和多进程有什么区别？主要缺点是什么？",
                answer:
                  "**快速回答** 哦，这个问题其实挺常见的。Python里的多线程和多进程主要区别在于线程共享内存，进程是独立的，GIL也有影响。主要缺点是多线程受限于GIL，多进程开销大。\n\n**详细回答** \nPython中的多线程和多进程有几个主要区别和各自的缺点：\n\n1. **内存共享**：\n   - **多线程**：线程之间共享内存，可以方便地共享数据，但需要小心处理同步问题。\n   - **多进程**：进程之间是独立的，不共享内存，通信需要通过进程间通信（IPC）机制，开销较大。\n\n2. **GIL（全局解释器锁）**：\n   - **多线程**：受限于GIL，同一时间只有一个线程在执行Python字节码，导致多线程在CPU密集型任务中性能不能充分发挥。\n   - **多进程**：每个进程有自己独立的Python解释器，不受GIL限制，适用于CPU密集型任务。\n\n3. **启动开销**：\n   - **多线程**：线程的启动和上下文切换开销较小。\n   - **多进程**：进程的启动和上下文切换开销较大。",
                positionId: 12,
                interviewCnt: 2,
                gmtCreate: "2024-07-10T07:25:31.000+00:00",
              },
              {
                gmtModified: "2024-07-10T07:25:42.000+00:00",
                companyId: -1,
                questionId: "1ee06ab8-61ae-41f5-a17e-054e0c4fdf6b",
                question: "数组有序条件太苛刻，你有什么办法放宽这个条件吗？",
                answer:
                  "**快速回答** 如果数组不是完全有序的，可以考虑使用分块排序或者跳表等方式来优化查找效率，这样可以在一定程度上放宽有序的条件。\n\n**详细回答** 如果数组的完全有序条件太苛刻，可以考虑以下几种方式来放宽要求：\n\n1. **分块排序**：将数组分成若干个小块，每个块内部有序，但块之间无序。这样可以在块内使用二分查找，整体查找效率仍然较高。\n2. **跳表**：使用跳表结构，使得即使数组不是完全有序，仍然可以通过多级索引进行较快的查找。\n\n这样可以在一定程度上放宽数组有序的条件，提升查找效率。",
                positionId: 12,
                interviewCnt: 2,
                gmtCreate: "2024-07-10T07:25:42.000+00:00",
              },
              {
                gmtModified: "2024-07-10T07:26:20.000+00:00",
                companyId: -1,
                questionId: "af826663-9d2a-469b-bd61-8ddf2e71c124",
                question: "对连续特征进行离散化的步骤是什么？",
                answer:
                  "**快速回答** 哦，就是把连续的特征先进行标准化处理，然后根据某些阈值将其离散化，比如分成几个区间。这样模型就能处理这些离散后的特征了。\n\n**详细回答** \n对连续特征进行离散化可以按以下步骤进行：\n1. **标准化处理**：对数据进行标准化，使其均值为0，方差为1。\n2. **设置阈值**：根据业务需求或数据分布设定几个阈值，将连续特征划分为多个区间。\n3. **离散化**：将连续特征的值根据这些阈值映射到不同的区间标签上。\n\n```python\nimport numpy as np\n\n# 假设有一个连续特征数组\ncontinuous_feature = np.array([1.5, 2.3, 3.7, 4.1, 5.6])\n\n# 标准化处理\nmean = np.mean(continuous_feature)\nstd = np.std(continuous_feature)\nstandardized_feature = (continuous_feature - mean) / std\n\n# 设置阈值进行离散化\nbins = [-np.inf, -1, 0, 1, np.inf]\ndiscrete_feature = np.digitize(standardized_feature, bins) - 1\n\nprint(discrete_feature)\n```\n\n这样就能将连续特征转换成离散特征。",
                positionId: 12,
                interviewCnt: 2,
                gmtCreate: "2024-07-10T07:26:20.000+00:00",
              },
            ].map((item) => {
              return (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <p>{item.question}</p>
                  <a onClick={() => toUrl("/coachMeeting")}>开始模拟</a>
                </div>
              );
            })}
          </div>
        </div>
      ),
    },
  ];

  const items = steps.map((item) => ({
    key: item.title,
    title: item.title,
  }));

  useEffect(() => {
    queryAllCompanies();
  }, []);

  return (
    <div className="historyContainer">
      <h1 style={{ textAlign: "center" }}>你的AI专属面试教练</h1>
      <Steps current={current} items={items} />
      <div style={contentStyle}>{steps[current].content}</div>
      <div style={{ marginTop: "10px" }}>
        {current < steps.length - 1 && (
          <Button type="primary" disabled={false} onClick={() => next()}>
            下一步
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button
            type="primary"
            onClick={() => message.success("Processing complete!")}
          >
            一键投递
          </Button>
        )}
        {current > 0 && (
          <Button
            style={{
              margin: "0 8px",
            }}
            onClick={() => prev()}
          >
            上一步
          </Button>
        )}
      </div>
    </div>
  );
}

export const pageConfig = definePageConfig(() => {
  return {
    title: "OfferWing AI-简历",
  };
});
