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
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { useState } from 'react';
import axios from 'axios';

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
	const [editDevice, setEditDevice] = useState<any>(null);
	const [editLocation, setEditLocation] = useState('');
	const [editTankType, setEditTankType] = useState('');
	const [saving, setSaving] = useState(false);
	const [saveMsg, setSaveMsg] = useState<string | null>(null);

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
	const openEdit = (device: any) => {
		setEditDevice(device);
		setEditLocation(device.location || '');
		setEditTankType(device.tank_type || '');
		setSaveMsg(null);
	};
	const closeEdit = () => {
		setEditDevice(null);
		setEditLocation('');
		setEditTankType('');
		setSaveMsg(null);
	};
	const handleEditSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editDevice) return;
		setSaving(true);
		setSaveMsg(null);
		try {
			await axios.patch(`/api/devices/${editDevice.id}`, {
				location: editLocation,
				tank_type: editTankType,
			});
			setSaveMsg('Saved!');
			// Optionally, refresh device list here
			setTimeout(() => closeEdit(), 1000);
		} catch (e: any) {
			setSaveMsg('Failed to save');
		} finally {
			setSaving(false);
		}
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
					<>
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{results.map((device) => (
								<div key={device.id} className="relative group">
									<DeviceCard
										device={device}
										onClick={() => handleDeviceClick(device.id)}
									/>
									<Dialog open={editDevice?.id === device.id} onOpenChange={open => open ? openEdit(device) : closeEdit()}>
										<DialogTrigger asChild>
											<Button
												variant="outline"
												size="sm"
												className="absolute top-2 right-2 opacity-80 group-hover:opacity-100"
												onClick={e => { e.stopPropagation(); openEdit(device); }}
											>
												Edit
											</Button>
										</DialogTrigger>
										<DialogContent>
											<h3 className="text-lg font-semibold mb-4">Edit Device Info</h3>
											<form className="space-y-4" onSubmit={handleEditSave}>
												<div>
													<label className="block text-xs font-medium mb-1">Location</label>
													<Input
														value={editLocation}
														onChange={e => setEditLocation(e.target.value)}
														placeholder="Enter location"
													/>
												</div>
												<div>
													<label className="block text-xs font-medium mb-1">Tank Type</label>
													<Input
														value={editTankType}
														onChange={e => setEditTankType(e.target.value)}
														placeholder="Enter tank type"
													/>
												</div>
												<Button type="submit" disabled={saving} className="w-full">
													{saving ? 'Saving...' : 'Save'}
												</Button>
												{saveMsg && <div className="text-xs mt-1 text-muted-foreground">{saveMsg}</div>}
											</form>
										</DialogContent>
									</Dialog>
								</div>
							))}
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default UserDashboard;
