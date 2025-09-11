import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth-context';
import { useDevices } from '@/hooks/useDevices';
import { useSearch } from '@/hooks/useSearch';
import { DeviceCard } from '@/components/device-card';
import { SearchBar } from '@/components/search-bar';
import { Card } from '@/components/ui/card';
import { Activity } from 'lucide-react';

import { useMemo, useState } from 'react';

const UserDashboard = () => {
	const navigate = useNavigate();
	const { user, logout } = useAuth();
	// Only show devices for this user
	const filterObj = { consumer_id: user?.consumer_id };
	const { data: devices, isLoading, error } = useDevices(filterObj);
	const { query, setQuery, results: searchResults } = useSearch({
		data: devices || [],
		searchFields: ['id']
	});

	const [locationFilter, setLocationFilter] = useState('all');
	const [tankTypeFilter, setTankTypeFilter] = useState('all');

	const locations = useMemo(() => {
		const set = new Set<string>();
		(devices || []).forEach(d => { if (d.location) set.add(d.location); });
		return Array.from(set);
	}, [devices]);

	const tankTypes = useMemo(() => {
		const set = new Set<string>();
		(devices || []).forEach(d => { if (d.tank_type) set.add(d.tank_type); });
		return Array.from(set);
	}, [devices]);

	const filteredResults = useMemo(() => {
		return searchResults.filter(d =>
			(locationFilter === 'all' || d.location === locationFilter) &&
			(tankTypeFilter === 'all' || d.tank_type === tankTypeFilter)
		);
	}, [searchResults, locationFilter, tankTypeFilter]);

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
									<div className="flex flex-col sm:flex-row gap-4 items-end">
										<div className="flex-1">
											<SearchBar
												value={query}
												onChange={setQuery}
												placeholder="Search by device ID..."
											/>
										</div>
										<select
											className="border rounded px-2 py-2 text-sm max-w-xs"
											value={locationFilter}
											onChange={e => setLocationFilter(e.target.value)}
										>
											<option value="all">All Locations</option>
											{locations.map(loc => (
												<option key={loc} value={loc}>{loc}</option>
											))}
										</select>
										<select
											className="border rounded px-2 py-2 text-sm max-w-xs"
											value={tankTypeFilter}
											onChange={e => setTankTypeFilter(e.target.value)}
										>
											<option value="all">All Tank Types</option>
											{tankTypes.map(type => (
												<option key={type} value={type}>{type}</option>
											))}
										</select>
									</div>
				</div>
			</div>
						<div className="max-w-7xl mx-auto p-6">
							{filteredResults.length === 0 ? (
								<Card className="p-8 text-center">
									<h3 className="text-lg font-semibold mb-2">No devices found</h3>
									<p className="text-muted-foreground">
										{query ? 'Try adjusting your search terms or filters' : 'No devices available'}
									</p>
								</Card>
							) : (
								<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
									{filteredResults.map((device) => (
										<DeviceCard
											key={device.id}
											device={device}
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
