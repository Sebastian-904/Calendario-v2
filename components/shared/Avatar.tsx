
import React from 'react';
import { classNames } from '../../utils/helpers';

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Avatar: React.FC<AvatarProps> = ({ name, avatarUrl, size = 'md' }) => {
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return names[0].substring(0, 2);
  };

  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  };
  
  const intToRGB = (i: number) => {
    const c = (i & 0x00FFFFFF).toString(16).toUpperCase();
    return "00000".substring(0, 6 - c.length) + c;
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-24 h-24 text-2xl',
  };

  if (avatarUrl) {
    return (
      <img
        className={classNames('rounded-full object-cover', sizeClasses[size])}
        src={avatarUrl}
        alt={name}
      />
    );
  }

  const initials = getInitials(name);
  const color = intToRGB(hashCode(name));

  return (
    <div
      className={classNames(
        'rounded-full flex items-center justify-center font-bold text-white',
        sizeClasses[size]
      )}
      style={{ backgroundColor: `#${color}` }}
    >
      {initials.toUpperCase()}
    </div>
  );
};

export default Avatar;
