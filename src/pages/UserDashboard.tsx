import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth-context';
import { useDevices } from '@/hooks/useDevices';
import { useSearch } from '@/hooks/useSearch';
import { DeviceCard } from '@/components/device-card';
import { SearchBar } from '@/components/search-bar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const UserDashboard = () => {
	const navigate = useNavigate();
	const { user, logout } = useAuth();
	// Only show devices for this user
	const filterObj = { consumer_id: user?.consumer_id };
	const { data: devices, isLoading, error } = useDevices(filterObj);
	const { query, setQuery, results } = useSearch({
		data: devices || [],
		searchFields: ['id']
	});
	const [username, setUsername] = useState(user?.name || '');
	const [password, setPassword] = useState('');
	// Placeholder handlers for username/password change
	const handleUsernameChange = (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: Implement backend call
		alert('Username change not implemented');
	};
	const handlePasswordChange = (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: Implement backend call
		alert('Password change not implemented');
	};
	const handleDeviceClick = (deviceId: string) => {
		navigate(`/device/${deviceId}`);
	};
	return (
		<div className="min-h-screen bg-background">
			<div className="border-b bg-card shadow-sm">
				<div className="max-w-7xl mx-auto p-6">
					<div className="flex items-center gap-3 mb-6 justify-between">
						<div className="flex items-center gap-3">
							<div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
								<Activity className="h-5 w-5" />
							</div>
							<div>
								<h1 className="text-2xl font-bold">User Dashboard</h1>
								<p className="text-muted-foreground">Devices assigned to you</p>
							</div>
						</div>
						<button
							className="ml-auto px-4 py-2 rounded bg-destructive text-white hover:bg-destructive/80 text-sm"
							onClick={() => { logout(); navigate('/login'); }}
						>
							Logout
						</button>
					</div>
					{/* Profile Card */}
					<Card className="mb-8 max-w-2xl mx-auto flex flex-col md:flex-row items-center gap-6 p-6">
						<Avatar className="h-20 w-20">
							<AvatarImage src={undefined} alt="User avatar" />
							<AvatarFallback>
								<img src="/placeholder.svg" alt="avatar" className="h-10 w-10" />
							</AvatarFallback>
						</Avatar>
						<div className="flex-1 w-full">
							<CardHeader className="p-0 mb-2">
								<CardTitle className="text-xl">{user?.name}</CardTitle>
								<div className="text-muted-foreground text-sm">Role: {user?.role}</div>
								<div className="text-muted-foreground text-sm">Devices: {devices ? devices.length : 0}</div>
							</CardHeader>
							<CardContent className="p-0">
								<form className="flex flex-col gap-2 mb-2" onSubmit={handleUsernameChange}>
									<label className="text-xs font-medium">Change Username</label>
									<div className="flex gap-2">
										<Input value={username} onChange={e => setUsername(e.target.value)} className="max-w-xs" />
										<Button type="submit" size="sm" disabled>Change</Button>
									</div>
								</form>
								<form className="flex flex-col gap-2 mb-2" onSubmit={handlePasswordChange}>
									<label className="text-xs font-medium">Change Password</label>
									<div className="flex gap-2">
										<Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="max-w-xs" />
										<Button type="submit" size="sm" disabled>Change</Button>
									</div>
								</form>
								<div className="flex gap-2 mt-2">
									<Button variant="destructive" size="sm" disabled>Delete User</Button>
									<Button variant="outline" size="sm" disabled>Suspend User</Button>
								</div>
							</CardContent>
						</div>
					</Card>
					<div className="flex flex-col sm:flex-row gap-4 items-end">
						<div className="flex-1">
							<SearchBar
								value={query}
								onChange={setQuery}
								placeholder="Search by device ID..."
							/>
						</div>
					</div>
				</div>
			</div>
			<div className="max-w-7xl mx-auto p-6">
				{results.length === 0 ? (
					<Card className="p-8 text-center">
						<h3 className="text-lg font-semibold mb-2">No devices found</h3>
						<p className="text-muted-foreground">
							{query ? 'Try adjusting your search terms' : 'No devices available'}
						</p>
					</Card>
				) : (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{results.map((device) => (
							<DeviceCard
								key={device.id}
								device={{ ...device, location: device.location, tank_type: device.tank_type }}
								onClick={() => handleDeviceClick(device.id)}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default UserDashboard;
