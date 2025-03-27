import React, { useCallback } from "react";
import { LogoutOutlined } from "@ant-design/icons";
import { Dropdown, Avatar } from "antd";
import type { MenuInfo } from "rc-menu/lib/interface";
import styles from "./index.module.css";
import { logout } from "@/services/user";
import store from "@/store";
import { sendLog } from "@/services/meeting";
import { toUrl } from "@/utils";

interface AvatarDropdownProps {
  name: string;
  avatar: string;
}

const AvatarDropdown: React.FC<AvatarDropdownProps> = ({ name, avatar }) => {
  const [user, userDispatcher] = store.useModel("user");
  const loginOut = async () => {
    await logout();
    location.reload();
  };

  const onMenuClick = useCallback((event: MenuInfo) => {
    const { key } = event;
    if (key === "logout") {
      sendLog({
        type: "clk",
        uid: user.currentUser.username,
        spm: "login.out.0.0",
        extInfo: JSON.stringify({}),
      });
      loginOut();
    }
  }, []);

  const menu = {
    items: [
      {
        key: "logout",
        label: "退出登录",
        icon: <LogoutOutlined />,
        onClick: onMenuClick,
        className: styles.menu,
      },
    ],
  };
  return (
    <Dropdown menu={menu}>
      <span className={`${styles.action} ${styles.account}`}>
        <Avatar
          size="small"
          className={styles.avatar}
          src={avatar}
          alt="avatar"
        />
        <span>{name}</span>
      </span>
    </Dropdown>
  );
};

export default AvatarDropdown;
