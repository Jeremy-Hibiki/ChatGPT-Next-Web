import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import EyeIcon from '../icons/eye.svg';
import LeftIcon from '../icons/left.svg';
import LightningIcon from '../icons/lightning.svg';

import { useCommand } from '../command';
import { Path, SlotID } from '../constant';
import Locale from '../locales';
import { BUILTIN_MASK_STORE } from '../masks';
import { useAppConfig, useChatStore } from '../store';
import { Mask, useMaskStore } from '../store/mask';
import { EmojiAvatar, IconButton, showConfirm } from '../ui';
import { MaskAvatar } from './mask';

import styles from './new-chat.module.scss';

function getIntersectionArea(aRect: DOMRect, bRect: DOMRect) {
  const xmin = Math.max(aRect.x, bRect.x);
  const xmax = Math.min(aRect.x + aRect.width, bRect.x + bRect.width);
  const ymin = Math.max(aRect.y, bRect.y);
  const ymax = Math.min(aRect.y + aRect.height, bRect.y + bRect.height);
  const width = xmax - xmin;
  const height = ymax - ymin;
  const intersectionArea = width < 0 || height < 0 ? 0 : width * height;
  return intersectionArea;
}

function MaskItem(props: { mask: Mask; onClick?: () => void }) {
  return (
    <div className={styles['mask']} onClick={props.onClick}>
      <MaskAvatar mask={props.mask} />
      <div className={styles['mask-name'] + ' one-line'}>{props.mask.name}</div>
    </div>
  );
}

function useMaskGroup(masks: Mask[]) {
  const [groups, setGroups] = useState<Mask[][]>([]);

  useEffect(() => {
    const computeGroup = () => {
      const appBody = document.getElementById(SlotID.AppBody);
      if (!appBody || masks.length === 0) return;

      const rect = appBody.getBoundingClientRect();
      const maxWidth = rect.width;
      const maxHeight = rect.height * 0.6;
      const maskItemWidth = 120;
      const maskItemHeight = 50;

      const randomMask = () => masks[Math.floor(Math.random() * masks.length)];
      let maskIndex = 0;
      const nextMask = () => masks[maskIndex++ % masks.length];

      const rows = Math.ceil(maxHeight / maskItemHeight);
      const cols = Math.ceil(maxWidth / maskItemWidth);

      const newGroups = new Array(rows)
        .fill(0)
        .map((_, _i) =>
          new Array(cols)
            .fill(0)
            .map((_, j) => (j < 1 || j > cols - 2 ? randomMask() : nextMask())),
        );

      setGroups(newGroups);
    };

    computeGroup();

    window.addEventListener('resize', computeGroup);
    return () => window.removeEventListener('resize', computeGroup);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return groups;
}

export function NewChat() {
  const chatStore = useChatStore();
  const maskStore = useMaskStore();

  const masks = maskStore.getAll();
  const groups = useMaskGroup(masks);

  const navigate = useNavigate();
  const config = useAppConfig();

  const maskRef = useRef<HTMLDivElement>(null);

  const { state } = useLocation();

  const startChat = (mask?: Mask) => {
    setTimeout(() => {
      chatStore.newSession(mask);
      navigate(Path.Chat);
    }, 10);
  };

  useCommand({
    mask: (id) => {
      try {
        const mask = maskStore.get(id) ?? BUILTIN_MASK_STORE.get(id);
        startChat(mask ?? undefined);
      } catch {
        console.error('[New Chat] failed to create chat from mask id=', id);
      }
    },
  });

  useEffect(() => {
    if (maskRef.current) {
      maskRef.current.scrollLeft = (maskRef.current.scrollWidth - maskRef.current.clientWidth) / 2;
    }
  }, [groups]);

  return (
    <div className={styles['new-chat']}>
      <div className={styles['mask-header']}>
        <IconButton
          icon={<LeftIcon />}
          text={Locale.NewChat.Return}
          onClick={() => navigate(Path.Home)}
        ></IconButton>
        {!state?.fromHome && (
          <IconButton
            text={Locale.NewChat.NotShow}
            onClick={async () => {
              if (await showConfirm(Locale.NewChat.ConfirmNoShow)) {
                startChat();
                config.update((config) => (config.dontShowMaskSplashScreen = true));
              }
            }}
          ></IconButton>
        )}
      </div>
      <div className={styles['mask-cards']}>
        <div className={styles['mask-card']}>
          <EmojiAvatar avatar="1f606" size={24} />
        </div>
        <div className={styles['mask-card']}>
          <EmojiAvatar avatar="1f916" size={24} />
        </div>
        <div className={styles['mask-card']}>
          <EmojiAvatar avatar="1f479" size={24} />
        </div>
      </div>

      <div className={styles['title']}>{Locale.NewChat.Title}</div>
      <div className={styles['sub-title']}>{Locale.NewChat.SubTitle}</div>

      <div className={styles['actions']}>
        <IconButton
          text={Locale.NewChat.More}
          onClick={() => navigate(Path.Masks)}
          icon={<EyeIcon />}
          bordered
          shadow
        />

        <IconButton
          text={Locale.NewChat.Skip}
          onClick={() => startChat()}
          icon={<LightningIcon />}
          type="primary"
          shadow
          className={styles['skip']}
        />
      </div>

      <div className={styles['masks']} ref={maskRef}>
        {groups.map((masks, i) => (
          <div key={i} className={styles['mask-row']}>
            {masks.map((mask, index) => (
              <MaskItem key={index} mask={mask} onClick={() => startChat(mask)} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
