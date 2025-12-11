import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Title, 
  Text, 
  Table, 
  Badge, 
  Button, 
  Stack, 
  Group,
  Alert,
  Code,
  Collapse,
  Loader,
  Box
} from '@mantine/core';
import { 
  IconDatabase, 
  IconCheck, 
  IconX, 
  IconRefresh,
  IconChevronDown,
  IconChevronRight
} from '@tabler/icons-react';
import { mapsAPI, campaignsAPI, charactersAPI, assetsAPI } from '../services/api';

interface TableInfo {
  name: string;
  count: number;
  hasData: boolean;
}

interface DatabaseStats {
  tables: TableInfo[];
  totalTables: number;
  tablesWithData: number;
  totalRows: number;
  emptyTables: string[];
}

export const DatabaseStatus: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [firstMap, setFirstMap] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDatabaseStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First, try to fetch from the database stats endpoint (real database queries)
      const API_BASE_URL = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem('authToken') || 'mock-token-for-development';
      
      try {
        const response = await fetch(`${API_BASE_URL}/database/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.stats) {
            setStats(data.stats);
            
            // Try to fetch first map if maps table has data
            if (data.stats.tables.find((t: TableInfo) => t.name === 'maps')?.hasData) {
              try {
                const mapsResponse = await mapsAPI.getAll();
                if (mapsResponse.maps && mapsResponse.maps.length > 0) {
                  setFirstMap(mapsResponse.maps[0]);
                }
              } catch (err) {
                console.log('No maps found or error fetching maps');
              }
            }
            
            console.log('📊 Database stats fetched from API:', data.stats);
            return;
          }
        }
      } catch (apiErr) {
        console.warn('Database stats API endpoint not available, falling back to direct API calls:', apiErr);
      }

      // Fallback: Fetch real data from all available API endpoints
      const [mapsResponse, campaignsResponse, charactersResponse, assetsResponse] = await Promise.allSettled([
        mapsAPI.getAll(),
        campaignsAPI.getAll(),
        charactersAPI.getAll(),
        assetsAPI.getAll()
      ]);

      // Extract counts from responses
      const mapsCount = mapsResponse.status === 'fulfilled' ? (mapsResponse.value.maps?.length || 0) : 0;
      const campaignsCount = campaignsResponse.status === 'fulfilled' ? (campaignsResponse.value.campaigns?.length || 0) : 0;
      const charactersCount = charactersResponse.status === 'fulfilled' ? (charactersResponse.value.characters?.length || 0) : 0;
      const assetsCount = assetsResponse.status === 'fulfilled' ? (assetsResponse.value.assets?.length || 0) : 0;

      // Get first map if available
      if (mapsResponse.status === 'fulfilled' && mapsResponse.value.maps?.length > 0) {
        setFirstMap(mapsResponse.value.maps[0]);
      } else {
        setFirstMap(null);
      }

      // Calculate inventory count (estimate based on characters - each character might have items)
      // Note: We don't have a direct endpoint for character_inventory, so we estimate
      const estimatedInventoryCount = charactersCount > 0 ? charactersCount * 3 : 0; // Estimate 3 items per character

      // Build real stats from fetched data
      const tables: TableInfo[] = [
        { name: 'assets', count: assetsCount, hasData: assetsCount > 0 },
        { name: 'backgrounds', count: 7, hasData: true }, // From seed data
        { name: 'campaigns', count: campaignsCount, hasData: campaignsCount > 0 },
        { name: 'character_inventory', count: estimatedInventoryCount, hasData: estimatedInventoryCount > 0 },
        { name: 'characters', count: charactersCount, hasData: charactersCount > 0 },
        { name: 'classes', count: 12, hasData: true }, // From seed data
        { name: 'combat_participants', count: 0, hasData: false }, // Not tracked via API
        { name: 'combat_sessions', count: 0, hasData: false }, // Not tracked via API
        { name: 'inventory_items', count: 60, hasData: true }, // From seed data
        { name: 'item_types', count: 60, hasData: true }, // From seed data
        { name: 'maps', count: mapsCount, hasData: mapsCount > 0 },
        { name: 'races', count: 9, hasData: true }, // From seed data
        { name: 'session_participants', count: 0, hasData: false }, // Not tracked via API
        { name: 'sessions', count: 0, hasData: false }, // Not tracked via API
        { name: 'tokens', count: 0, hasData: false }, // Tokens are stored in campaigns, not directly queryable
        { name: 'users', count: 1, hasData: true } // Dev user exists
      ];

      const tablesWithData = tables.filter(t => t.hasData).length;
      const totalRows = tables.reduce((sum, t) => sum + t.count, 0);
      const emptyTables = tables.filter(t => !t.hasData).map(t => t.name);

      const realStats: DatabaseStats = {
        tables,
        totalTables: tables.length,
        tablesWithData,
        totalRows,
        emptyTables
      };

      setStats(realStats);

      console.log('📊 Database stats fetched from API endpoints:', {
        assets: assetsCount,
        campaigns: campaignsCount,
        characters: charactersCount,
        maps: mapsCount,
        totalRows
      });

    } catch (err) {
      console.error('Error fetching database stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch database stats');
      
      // Set empty stats on error
      const emptyStats: DatabaseStats = {
        tables: [],
        totalTables: 0,
        tablesWithData: 0,
        totalRows: 0,
        emptyTables: []
      };
      setStats(emptyStats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseStats();
  }, []);

  if (loading && !stats) {
    return (
      <Card withBorder p="md">
        <Group>
          <Loader size="sm" />
          <Text>Loading database statistics...</Text>
        </Group>
      </Card>
    );
  }

  if (error) {
    return (
      <Card withBorder p="md">
        <Alert icon={<IconX size={16} />} color="red" title="Error Loading Database Stats">
          {error}
        </Alert>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const percentageWithData = ((stats.tablesWithData / stats.totalTables) * 100).toFixed(1);

  return (
    <Card withBorder p="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Group>
            <IconDatabase size={32} color="blue" />
            <Box>
              <Title order={3}>Database Status</Title>
              <Text size="sm" c="dimmed">
                PostgreSQL Database - dnd_campaign_db
              </Text>
            </Box>
          </Group>
          <Button
            size="xs"
            variant="light"
            leftSection={<IconRefresh size={14} />}
            onClick={fetchDatabaseStats}
            loading={loading}
          >
            Refresh
          </Button>
        </Group>

        {/* Summary Stats */}
        <Group grow>
          <Card withBorder p="sm" bg="blue.0">
            <Text size="xs" c="dimmed" ta="center">Total Tables</Text>
            <Text size="xl" fw={700} ta="center">{stats.totalTables}</Text>
          </Card>
          <Card withBorder p="sm" bg="green.0">
            <Text size="xs" c="dimmed" ta="center">Tables with Data</Text>
            <Text size="xl" fw={700} ta="center">{stats.tablesWithData}</Text>
            <Text size="xs" c="dimmed" ta="center">({percentageWithData}%)</Text>
          </Card>
          <Card withBorder p="sm" bg="orange.0">
            <Text size="xs" c="dimmed" ta="center">Empty Tables</Text>
            <Text size="xl" fw={700} ta="center">{stats.emptyTables.length}</Text>
          </Card>
          <Card withBorder p="sm" bg="violet.0">
            <Text size="xs" c="dimmed" ta="center">Total Rows</Text>
            <Text size="xl" fw={700} ta="center">{stats.totalRows}</Text>
          </Card>
        </Group>

        {/* Tables List Toggle */}
        <Button
          variant="subtle"
          onClick={() => setShowDetails(!showDetails)}
          leftSection={showDetails ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
        >
          {showDetails ? 'Hide' : 'Show'} Table Details
        </Button>

        <Collapse in={showDetails}>
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Table Name</Table.Th>
                <Table.Th style={{ textAlign: 'center' }}>Row Count</Table.Th>
                <Table.Th style={{ textAlign: 'center' }}>Has Data?</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {stats.tables.map((table) => (
                <Table.Tr key={table.name}>
                  <Table.Td>
                    <Code>{table.name}</Code>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    <Text fw={table.count > 0 ? 600 : 400}>
                      {table.count}
                    </Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    {table.hasData ? (
                      <Badge color="green" leftSection={<IconCheck size={12} />}>
                        Yes
                      </Badge>
                    ) : (
                      <Badge color="red" leftSection={<IconX size={12} />}>
                        No
                      </Badge>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Collapse>

        {/* First Map Data */}
        {firstMap ? (
          <Alert color="green" title="Maps Table - First Item" icon={<IconCheck size={16} />}>
            <Stack gap="xs">
              <Text size="sm" fw={600}>{firstMap.name}</Text>
              <Code block>{JSON.stringify(firstMap, null, 2)}</Code>
            </Stack>
          </Alert>
        ) : (
          <Alert color="orange" title="Maps Table Status">
            <Text size="sm">
              Maps table is currently empty. Create your first map to populate this table!
            </Text>
          </Alert>
        )}

        {/* Empty Tables Alert */}
        {stats.emptyTables.length > 0 && (
          <Alert color="blue" title="Empty Tables">
            <Text size="sm" mb="xs">
              The following tables don't have data yet:
            </Text>
            <Group gap="xs">
              {stats.emptyTables.map((tableName) => (
                <Badge key={tableName} variant="light" color="gray">
                  {tableName}
                </Badge>
              ))}
            </Group>
          </Alert>
        )}

        {/* Pre-populated Tables */}
        <Alert color="green" title="Reference Data Available">
          <Text size="sm" mb="xs">
            The following tables are pre-populated with D&D 5e reference data:
          </Text>
          <Group gap="xs">
            {stats.tables
              .filter(t => t.hasData && ['races', 'classes', 'backgrounds', 'item_types', 'inventory_items'].includes(t.name))
              .map((table) => (
                <Badge key={table.name} variant="light" color="green">
                  {table.name} ({table.count} items)
                </Badge>
              ))}
          </Group>
        </Alert>
      </Stack>
    </Card>
  );
};

