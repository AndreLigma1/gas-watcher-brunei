
import React from 'react';
import placeholderImg from '@/../public/placeholder.svg';


interface UserCardProps {
  user: { consumer_id: string; name: string };
  onClick: (consumer_id: string) => void;
  showStaticImage?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ user, onClick, showStaticImage }) => (
  <div
    className="p-4 border rounded shadow hover:bg-muted cursor-pointer flex items-center gap-4"
    onClick={() => onClick(user.consumer_id)}
  >
    {showStaticImage && (
      <img
        src={placeholderImg}
        alt="Profile"
        className="w-12 h-12 rounded-full object-cover border"
        style={{ background: '#EAEAEA' }}
      />
    )}
    <div>
      <h3 className="font-semibold text-lg">{user.name}</h3>
      <p className="text-xs text-muted-foreground">ID: {user.consumer_id}</p>
    </div>
  </div>
);

export default UserCard;
