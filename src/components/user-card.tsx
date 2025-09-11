import React from 'react';

interface UserCardProps {
  user: { consumer_id: string; name: string };
  onClick: (consumer_id: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onClick }) => (
  <div
    className="p-4 border rounded shadow hover:bg-muted cursor-pointer"
    onClick={() => onClick(user.consumer_id)}
  >
    <h3 className="font-semibold text-lg">{user.name}</h3>
    <p className="text-xs text-muted-foreground">ID: {user.consumer_id}</p>
  </div>
);

export default UserCard;
