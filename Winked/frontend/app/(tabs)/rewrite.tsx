import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	Image,
	ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePersona } from '../../context/PersonaContext';
import { getHistory, rewriteText } from '../../services/api';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@react-navigation/native';

type ConversationEntry = {
	id: string;
	input: string;
	output: string;
	createdAt: string;
};

export default function RewriteScreen() {
	const { colors } = useTheme();
	const router = useRouter();
	const { selectedPersona } = usePersona();
	const scrollRef = useRef<ScrollView | null>(null);
	const MIN_INPUT_HEIGHT = 56;
	const MAX_INPUT_HEIGHT = 170;
	const [text, setText] = useState('');
	const [error, setError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [copiedEntryId, setCopiedEntryId] = useState<string | null>(null);
	const [conversationsByPersona, setConversationsByPersona] = useState<
		Record<string, ConversationEntry[]>
	>({});
	const [inputHeight, setInputHeight] = useState(MIN_INPUT_HEIGHT);

	const currentConversation = useMemo(() => {
		if (!selectedPersona) return [];
		return conversationsByPersona[selectedPersona.id] ?? [];
	}, [conversationsByPersona, selectedPersona]);

	const handlePersonaPress = () => {
		// Takes user back to personas tab to pick one
		router.replace('/');
	};

	const clearLocalThread = () => {
		if (!selectedPersona) return;
		setConversationsByPersona((prev) => ({
			...prev,
			[selectedPersona.id]: [],
		}));
		setCopiedEntryId(null);
	};

	useEffect(() => {
		if (!selectedPersona) return;
		let isMounted = true;

		const loadPersonaHistory = async () => {
			try {
				const history = await getHistory(100, selectedPersona.id);
				if (!isMounted) return;

				// API returns newest first; chat UI reads naturally oldest to newest.
				const mapped = history
					.slice()
					.reverse()
					.map((item) => ({
						id: item.id,
						input: item.inputText ?? '',
						output: item.outputText ?? '',
						createdAt: item.createdAt,
					}));

				setConversationsByPersona((prev) => {
					const existing = prev[selectedPersona.id] ?? [];
					const merged = [...mapped, ...existing];
					const deduped = Array.from(
						new Map(merged.map((entry) => [entry.id, entry])).values(),
					).sort(
						(a, b) =>
							new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
					);
					return { ...prev, [selectedPersona.id]: deduped };
				});
			} catch {
				// Keep local session conversation if history fetch fails.
			}
		};

		loadPersonaHistory();
		return () => {
			isMounted = false;
		};
	}, [selectedPersona]);

	const handleSubmit = async () => {
		const normalized = text.trim();
		if (!normalized) return;
		if (!selectedPersona) {
			setError('Select a persona first.');
			return;
		}

		try {
			setIsSubmitting(true);
			setError('');
			const response = await rewriteText({
				text: normalized,
				personaID: selectedPersona.id,
			});

			const entryID =
				response.historyId || response.transformId || `${Date.now()}`;
			const newEntry: ConversationEntry = {
				id: entryID,
				input: normalized,
				output: response.transformedText,
				createdAt: new Date().toISOString(),
			};
			setConversationsByPersona((prev) => ({
				...prev,
				[selectedPersona.id]: [...(prev[selectedPersona.id] ?? []), newEntry],
			}));
			setText('');
			setInputHeight(MIN_INPUT_HEIGHT);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to rewrite text');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCopyOutput = async (entry: ConversationEntry) => {
		if (!entry.output) return;
		await Clipboard.setStringAsync(entry.output);
		setCopiedEntryId(entry.id);
		setTimeout(() => {
			setCopiedEntryId((prev) => (prev === entry.id ? null : prev));
		}, 1400);
	};

	return (
		<View
			style={{
				flex: 1,
				backgroundColor: colors.background,
				paddingHorizontal: 16,
				paddingTop: 10,
			}}
		>
			{/* Persona selection area */}
			<View style={{ alignItems: 'center', marginTop: 10 }}>
				<TouchableOpacity onPress={handlePersonaPress}>
					{selectedPersona ? (
						<Image
							source={selectedPersona.image}
							style={{
								width: 74,
								height: 74,
								borderRadius: 37,
								borderWidth: 2,
								borderColor: '#ccc',
							}}
						/>
					) : (
						<View
							style={{
								width: 74,
								height: 74,
								borderRadius: 37,
								borderWidth: 2,
								borderColor: '#ccc',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<Ionicons name="add" size={30} color="#777" />
						</View>
					)}
				</TouchableOpacity>

				<Text style={{ marginTop: 6, fontSize: 15 }}>
					{selectedPersona ? selectedPersona.name : 'Select a persona'}
				</Text>
			</View>

			{selectedPersona && currentConversation.length > 0 ? (
				<TouchableOpacity
					onPress={clearLocalThread}
					style={{
						alignSelf: 'flex-end',
						marginTop: 8,
						paddingHorizontal: 10,
						paddingVertical: 6,
						borderRadius: 8,
						backgroundColor: '#ffe5e5',
					}}
				>
					<Text style={{ color: '#b00020', fontWeight: '600' }}>
						Clear View
					</Text>
				</TouchableOpacity>
			) : null}

			{/* Conversation area */}
			<View
				style={{
					flex: 1,
					marginTop: 10,
					borderWidth: 1,
					borderColor: colors.border,
					borderRadius: 14,
					backgroundColor: colors.card,
					overflow: 'hidden',
				}}
			>
				<ScrollView
					ref={scrollRef}
					contentContainerStyle={{ padding: 12, gap: 10 }}
					onContentSizeChange={() =>
						scrollRef.current?.scrollToEnd({ animated: true })
					}
				>
					{currentConversation.length === 0 ? (
						<Text style={{ color: '#666', textAlign: 'center', marginTop: 20 }}>
							Rewritten messages for this persona will appear here.
						</Text>
					) : (
						currentConversation.map((entry) => (
							<View key={entry.id}>
								<View
									style={{
										alignSelf: 'flex-end',
										maxWidth: '90%',
										backgroundColor: '#e8e0f4',
										borderRadius: 12,
										padding: 10,
										marginBottom: 6,
									}}
								>
									<Text
										style={{ fontSize: 12, color: '#5f5f5f', marginBottom: 4 }}
									>
										You
									</Text>
									<Text>{entry.input}</Text>
								</View>

								<View
									style={{
										alignSelf: 'flex-start',
										maxWidth: '95%',
										backgroundColor: '#f3ecfb',
										borderRadius: 12,
										padding: 10,
									}}
								>
									<View
										style={{
											flexDirection: 'row',
											alignItems: 'center',
											marginBottom: 4,
										}}
									>
										<Text style={{ fontSize: 12, color: '#5f5f5f', flex: 1 }}>
											{selectedPersona?.name || 'Persona'}
										</Text>
										<TouchableOpacity
											onPress={() => handleCopyOutput(entry)}
											hitSlop={8}
										>
											<Ionicons name="copy-outline" size={18} color="#6a1b9a" />
										</TouchableOpacity>
									</View>
									<Text>{entry.output}</Text>
									{copiedEntryId === entry.id ? (
										<Text
											style={{ color: '#2e7d32', fontSize: 12, marginTop: 6 }}
										>
											Copied
										</Text>
									) : null}
								</View>
							</View>
						))
					)}
				</ScrollView>
			</View>

			{/* Input box */}
			<View style={{ marginTop: 10 }}>
				<TextInput
					value={text}
					onChangeText={setText}
					onContentSizeChange={(event) => {
						if (text.trim().length === 0) {
							setInputHeight(MIN_INPUT_HEIGHT);
							return;
						}
						const nextHeight = Math.min(
							Math.max(
								event.nativeEvent.contentSize.height + 16,
								MIN_INPUT_HEIGHT,
							),
							MAX_INPUT_HEIGHT,
						);
						setInputHeight(nextHeight);
					}}
					placeholder={
						selectedPersona
							? "Input here... (The longer the message, the less you'll be able to rewrite new messages)"
							: 'Pick a persona to rewrite your message'
					}
					placeholderTextColor="#666"
					editable
					multiline
					scrollEnabled={inputHeight >= MAX_INPUT_HEIGHT}
					returnKeyType="send"
					submitBehavior="submit"
					onSubmitEditing={handleSubmit}
					style={{
						borderWidth: 1,
						borderColor: colors.border,
						borderRadius: 15,
						padding: 15,
						fontSize: 16,
						backgroundColor: colors.card,
						color: colors.text,
						textAlignVertical: 'top',
						minHeight: MIN_INPUT_HEIGHT,
						height: inputHeight,
						maxHeight: MAX_INPUT_HEIGHT,
					}}
				/>
			</View>

			<TouchableOpacity
				onPress={handleSubmit}
				disabled={isSubmitting}
				style={{
					marginTop: 10,
					backgroundColor: isSubmitting ? '#b695cb' : '#6a1b9a',
					borderRadius: 12,
					paddingVertical: 14,
					alignItems: 'center',
				}}
			>
				<Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
					{isSubmitting ? 'Rewriting...' : 'Rewrite'}
				</Text>
			</TouchableOpacity>

			{error ? (
				<Text style={{ marginTop: 12, color: '#b00020', textAlign: 'center' }}>
					{error}
				</Text>
			) : null}
		</View>
	);
}
