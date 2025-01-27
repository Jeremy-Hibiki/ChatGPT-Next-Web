import { useNavigate } from 'react-router-dom';

import BotIcon from '../icons/bot.svg';

import { Path } from '../constant';
import Locale from '../locales';
import { useAccessStore } from '../store';
import { IconButton } from '../ui';

import styles from './auth.module.scss';

export function AuthPage() {
  const navigate = useNavigate();
  const access = useAccessStore();

  const goHome = () => navigate(Path.Home);

  return (
    <div className={styles['auth-page']}>
      <div className={`no-dark ${styles['auth-logo']}`}>
        <BotIcon />
      </div>

      <div className={styles['auth-title']}>{Locale.Auth.Title}</div>
      <div className={styles['auth-tips']}>{Locale.Auth.Tips}</div>

      <input
        className={styles['auth-input']}
        type="password"
        placeholder={Locale.Auth.Input}
        value={access.accessCode}
        onChange={(e) => {
          access.updateCode(e.currentTarget.value);
        }}
      />

      <div className={styles['auth-actions']}>
        <IconButton text={Locale.Auth.Confirm} type="primary" onClick={goHome} />
        <IconButton text={Locale.Auth.Later} onClick={goHome} />
      </div>
    </div>
  );
}
