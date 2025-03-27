import { Modal } from 'antd';
import { downLoadImg } from '../../utils';
import './index.css';

const GroupModal = (props) => {
  const { isShow, closeModal, url = 'https://aliyun.artpai.xyz/front/normalGroup.jpeg' } = props;

  return (
    <Modal
      width={300}
      open={isShow}
      className="groupModal"
      title={null}
      footer={null}
      closable={false}
      maskClosable={true}
      onCancel={closeModal}
    >
      <img src={url} />
      <p className="saveGroupIcon" onClick={() => downLoadImg('https://aliyun.artpai.xyz/front/normalGroup.jpeg')}>
        <img src="https://aliyun.artpai.xyz/front/download2.png" />
        保存
      </p>
      <p>截图或保存二维码</p>
      <p>在微信中扫描添加</p>
    </Modal>
  );
};

export default GroupModal;
