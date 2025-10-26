import React, { useState } from 'react';
import {
  Modal,
  Stack,
  Text,
  Button,
  Group,
  Badge,
  Card,
  ScrollArea,
  Alert,
  SimpleGrid,
  Divider,
  NumberInput,
  ActionIcon
} from '@mantine/core';
import {
  IconSword,
  IconPlayerPlay,
  IconPlayerStop,
  IconArrowRight,
  IconRefresh,
  IconClock,
  IconDice,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { useMapStore } from '../stores/mapStore';
import { CombatParticipant, Token } from '../types/models';
import { rollInitiative, calculateInitiativeOrder } from '../utils/combatUtils';

interface CombatManagerProps {
  opened: boolean;
  onClose: () => void;
  tokens: Token[];
}

interface InitiativeDialogProps {
  opened: boolean;
  onClose: () => void;
  tokens: Token[];
  onStartCombat: (participants: CombatParticipant[]) => void;
  assets: any[];
  getDexModifier: (token: Token) => number;
}

const InitiativeDialog: React.FC<InitiativeDialogProps> = ({
  opened,
  onClose,
  tokens,
  onStartCombat,
  assets,
  getDexModifier
}) => {
  const [participants, setParticipants] = useState<CombatParticipant[]>([]);

  const addTokenToCombat = (token: Token) => {
    const dexModifier = getDexModifier(token);
    const initiative = rollInitiative(dexModifier);
    
    const participant: CombatParticipant = {
      tokenId: token.id,
      tokenName: token.name,
      initiative: initiative.total,
      dexModifier,
      hasAction: true,
      hasBonusAction: true,
      hp: token.hp
    };
    
    setParticipants(prev => [...prev, participant]);
  };

  const removeParticipant = (tokenId: string) => {
    setParticipants(prev => prev.filter(p => p.tokenId !== tokenId));
  };

  const updateInitiative = (tokenId: string, initiative: number) => {
    setParticipants(prev => 
      prev.map(p => p.tokenId === tokenId ? { ...p, initiative } : p)
    );
  };

  const rollAllInitiative = () => {
    setParticipants(prev => 
      prev.map(p => {
        const initiative = rollInitiative(p.dexModifier);
        return { ...p, initiative: initiative.total };
      })
    );
  };

  const startCombat = () => {
    if (participants.length === 0) return;
    
    const orderedParticipants = calculateInitiativeOrder(participants);
    onStartCombat(orderedParticipants);
  };

  const availableTokens = tokens.filter(token => 
    !participants.some(p => p.tokenId === token.id)
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Set Initiative"
      size="lg"
    >
      <Stack gap="md">
        <Alert icon={<IconDice size={16} />} color="blue" variant="light">
          Add tokens to combat and set their initiative order. You can roll initiative automatically or set it manually.
        </Alert>

        {/* Available Tokens */}
        {availableTokens.length > 0 && (
          <Card withBorder p="md">
            <Text fw={600} mb="sm">Available Tokens</Text>
            <ScrollArea h={150}>
              <Stack gap="xs">
                {availableTokens.map(token => (
                  <Group key={token.id} justify="space-between">
                    <Group gap="xs">
                      <Text>{token.name}</Text>
                      {token.hp && (
                        <Badge size="sm" color="red">
                          {token.hp.current}/{token.hp.max} HP
                        </Badge>
                      )}
                    </Group>
                    <Button
                      size="xs"
                      leftSection={<IconPlus size={12} />}
                      onClick={() => addTokenToCombat(token)}
                    >
                      Add
                    </Button>
                  </Group>
                ))}
              </Stack>
            </ScrollArea>
          </Card>
        )}

        {/* Combat Participants */}
        {participants.length > 0 && (
          <Card withBorder p="md">
            <Group justify="space-between" mb="sm">
              <Text fw={600}>Combat Participants</Text>
              <Button
                size="xs"
                leftSection={<IconDice size={12} />}
                onClick={rollAllInitiative}
                variant="outline"
              >
                Roll All
              </Button>
            </Group>
            
            <ScrollArea h={200}>
              <Stack gap="xs">
                {participants.map((participant, index) => (
                  <Group key={participant.tokenId} justify="space-between">
                    <Group gap="xs">
                      <Text size="sm" c="dimmed">#{index + 1}</Text>
                      <Text>{participant.tokenName}</Text>
                      <Badge size="sm" color="blue">
                        Init: {participant.initiative}
                      </Badge>
                      <Badge size="sm" color="green">
                        Dex: {participant.dexModifier >= 0 ? '+' : ''}{participant.dexModifier}
                      </Badge>
                    </Group>
                    <Group gap="xs">
                      <NumberInput
                        size="xs"
                        w={80}
                        value={participant.initiative}
                        onChange={(value) => updateInitiative(participant.tokenId, typeof value === 'number' ? value : 0)}
                        min={-10}
                        max={50}
                      />
                      <ActionIcon
                        size="sm"
                        color="red"
                        variant="subtle"
                        onClick={() => removeParticipant(participant.tokenId)}
                      >
                        <IconTrash size={12} />
                      </ActionIcon>
                    </Group>
                  </Group>
                ))}
              </Stack>
            </ScrollArea>
          </Card>
        )}

        <Divider />

        <Group justify="flex-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={startCombat}
            disabled={participants.length === 0}
            leftSection={<IconPlayerPlay size={16} />}
          >
            Start Combat
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export const CombatManager: React.FC<CombatManagerProps> = ({ opened, onClose, tokens }) => {
  const { combat, assets, endCombat, nextTurn } = useMapStore();
  const [showInitiative, setShowInitiative] = useState(false);

  // Get DEX modifier for a token
  const getDexModifier = (token: Token): number => {
    const asset = assets.find(a =>
      a.type === 'token' &&
      (a.name.includes(token.name) || a.tokenData?.description?.includes(token.name))
    );

    return asset?.tokenData?.modifiers?.dex || 0;
  };

  // Handle starting combat
  const handleStartCombat = (participants: CombatParticipant[]) => {
    const { startCombat } = useMapStore.getState();
    startCombat(participants);
    setShowInitiative(false);
  };

  // Handle action usage
  const handleUseAction = (tokenId: string) => {
    const { consumeAction } = useMapStore.getState();
    consumeAction(tokenId);
  };

  // Handle bonus action usage
  const handleUseBonusAction = (tokenId: string) => {
    const { consumeBonusAction } = useMapStore.getState();
    consumeBonusAction(tokenId);
  };

  // Get current participant
  const currentParticipant = combat.participants?.[combat.currentTurnIndex];

  // Calculate turn order display
  const turnOrder = (combat.participants || []).map((p: CombatParticipant, index: number) => ({
    participant: p,
    isCurrent: index === combat.currentTurnIndex,
    isNext: index === (combat.currentTurnIndex + 1) % Math.max(combat.participants.length, 1)
  }));

  return (
    <>
      <Modal
        opened={opened && combat.isActive}
        onClose={onClose}
        title={
          <Group gap="xs">
            <IconSword size={20} />
            <Text fw={600}>Combat Manager</Text>
            <Badge color="red" variant="light">Round {combat.round}</Badge>
          </Group>
        }
        size="xl"
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        <Stack gap="md">
          {/* Current Turn Display */}
          {currentParticipant && (
            <Alert
              icon={<IconClock size={16} />}
              color="blue"
              variant="filled"
              title={`${currentParticipant.tokenName}'s Turn`}
            >
              <Group justify="space-between" mt="xs">
                <Group gap="xs">
                  <Badge color={currentParticipant.hasAction ? 'green' : 'gray'}>
                    {currentParticipant.hasAction ? 'Action Available' : 'Action Used'}
                  </Badge>
                  <Badge color={currentParticipant.hasBonusAction ? 'green' : 'gray'}>
                    {currentParticipant.hasBonusAction ? 'Bonus Action Available' : 'Bonus Action Used'}
                  </Badge>
                </Group>
              </Group>
            </Alert>
          )}

          {/* Turn Order */}
          <Card withBorder p="md">
            <Text fw={600} mb="sm">Initiative Order</Text>
            <ScrollArea h={200}>
              <Stack gap="xs">
                {turnOrder.map((turn: { participant: CombatParticipant; isCurrent: boolean; isNext: boolean }, index: number) => {
                  const token = tokens.find(t => t.id === turn.participant.tokenId);
                  return (
                    <Group
                      key={turn.participant.tokenId}
                      p="sm"
                      style={{
                        backgroundColor: turn.isCurrent ? '#e7f5ff' : undefined,
                        border: turn.isCurrent ? '2px solid #339af0' : '1px solid transparent',
                        borderRadius: 4
                      }}
                      justify="space-between"
                    >
                      <Group gap="xs">
                        {turn.isCurrent ? (
                          <IconArrowRight size={18} color="#339af0" />
                        ) : (
                          <Text size="sm" c="dimmed" style={{ width: 18, textAlign: 'center' }}>
                            {index + 1}
                          </Text>
                        )}
                        <Text fw={turn.isCurrent ? 600 : 400}>{turn.participant.tokenName}</Text>
                        {token?.hp && (
                          <Badge color={token.hp.current > token.hp.max * 0.5 ? 'green' : 'red'}>
                            {token.hp.current}/{token.hp.max}
                          </Badge>
                        )}
                      </Group>
                      <Group gap="xs">
                        <Badge variant="outline" size="sm">
                          Init: {turn.participant.initiative}
                        </Badge>
                        <Badge
                          color={turn.participant.hasAction ? 'green' : 'gray'}
                          variant="light"
                          size="xs"
                        >
                          Action
                        </Badge>
                        <Badge
                          color={turn.participant.hasBonusAction ? 'green' : 'gray'}
                          variant="light"
                          size="xs"
                        >
                          Bonus
                        </Badge>
                      </Group>
                    </Group>
                  );
                })}
              </Stack>
            </ScrollArea>
          </Card>

          {/* Action Controls */}
          {currentParticipant && (
            <SimpleGrid cols={2} spacing="sm">
              <Button
                fullWidth
                variant={currentParticipant.hasAction ? 'light' : 'outline'}
                color={currentParticipant.hasAction ? 'green' : 'gray'}
                leftSection={<IconSword size={18} />}
                onClick={() => handleUseAction(currentParticipant.tokenId)}
                disabled={!currentParticipant.hasAction}
              >
                Use Action
              </Button>
              <Button
                fullWidth
                variant={currentParticipant.hasBonusAction ? 'light' : 'outline'}
                color={currentParticipant.hasBonusAction ? 'green' : 'gray'}
                leftSection={<IconRefresh size={18} />}
                onClick={() => handleUseBonusAction(currentParticipant.tokenId)}
                disabled={!currentParticipant.hasBonusAction}
              >
                Use Bonus Action
              </Button>
            </SimpleGrid>
          )}

          <Divider />

          {/* End Turn / End Combat */}
          <Group grow>
            <Button
              variant="outline"
              onClick={() => {
                endCombat();
                onClose();
              }}
              leftSection={<IconPlayerStop size={18} />}
            >
              End Combat
            </Button>
            <Button
              onClick={nextTurn}
              leftSection={<IconArrowRight size={18} />}
            >
              Next Turn
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Initiative Dialog */}
      <InitiativeDialog
        opened={showInitiative}
        onClose={() => setShowInitiative(false)}
        tokens={tokens}
        onStartCombat={handleStartCombat}
        assets={assets}
        getDexModifier={getDexModifier}
      />

      {/* Start Combat Prompt */}
      {!combat.isActive && (
        <Modal
          opened={opened && !combat.isActive}
          onClose={onClose}
          title={
            <Group gap="xs">
              <IconSword size={20} />
              <Text fw={600}>Start Combat?</Text>
            </Group>
          }
          size="md"
        >
          <Stack gap="md">
            <Text>
              Would you like to start a combat encounter? This will begin initiative tracking.
            </Text>
            <Group justify="flex-end">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={() => setShowInitiative(true)}
                leftSection={<IconPlayerPlay size={18} />}
              >
                Start Combat
              </Button>
            </Group>
          </Stack>
        </Modal>
      )}
    </>
  );
};
