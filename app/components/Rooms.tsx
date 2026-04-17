import React, { useCallback, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

type CurrentUser = {
  id: number;
  email: string;
  username: string;
};

type ChatRoomProps = {
  currentUser: CurrentUser | null;
};

type Room = {
  id: number;
  name: string;
  create_by: number;
  created_at: string;
};

type Message = {
  id: number;
  room_id: number;
  user_id: number;
  username: string;
  text: string;
  created_at: string;
};

type ApiError = {
  error?: string;
};

const isMessage = (value: unknown): value is Message => {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "room_id" in value &&
    "user_id" in value &&
    "username" in value &&
    "text" in value &&
    "created_at" in value
  );
};

const API_BASE_URL = "http://localhost:3001";

const hasApiError = (value: unknown): value is ApiError => {
  return typeof value === "object" && value !== null && "error" in value;
};

const isRoom = (value: unknown): value is Room => {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    "created_at" in value
  );
};

const isRoomArray = (value: unknown): value is Room[] => {
  return Array.isArray(value);
};

const isMessageArray = (value: unknown): value is Message[] => {
  return Array.isArray(value);
};

export const ChatRooms = ({ currentUser }: ChatRoomProps) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomName, setRoomName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3001", {
      withCredentials: true,
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket || !selectedRoom) {
      return;
    }
    socket.emit("join_room", selectedRoom.id);
  }, [socket, selectedRoom]);

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.on("receive_message", (messageData) => {
      setMessages((prev) => [...prev, messageData]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [socket]);

  const clearStatus = () => {
    setStatusMessage("");
    setStatusType("success");
  };

  const setErrorStatus = (message: string) => {
    setStatusMessage(message);
    setStatusType("error");
  };

  const setSuccessStatus = (message: string) => {
    setStatusMessage(message);
    setStatusType("success");
  };

  const fetchRooms = useCallback(async () => {
    clearStatus();

    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch rooms");
      }

      const roomList: unknown = await response.json();

      if (hasApiError(roomList) && roomList.error) {
        setErrorStatus(roomList.error);
        return;
      }

      if (!isRoomArray(roomList)) {
        throw new Error("Invalid rooms response");
      }

      setRooms(roomList);
    } catch {
      setErrorStatus("Failed to fetch rooms");
    }
  }, []);

  const createRoom = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearStatus();

    const trimmedRoomName = roomName.trim();

    if (!trimmedRoomName) {
      setErrorStatus("Room name is required");
      return;
    }

    setIsCreatingRoom(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedRoomName }),
      });

      if (!response.ok) {
        throw new Error("Failed to create room");
      }

      const data: unknown = await response.json();

      if (hasApiError(data) && data.error) {
        setErrorStatus(data.error);
        return;
      }

      if (!isRoom(data)) {
        throw new Error("Invalid room response");
      }

      setSuccessStatus(`Created room ${data.name}`);
      setRoomName("");
      setSelectedRoom(data);
      setMessageText("");
      await fetchRooms();
      await fetchMessages(data.id);
    } catch {
      setErrorStatus("Failed to create room");
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const fetchMessages = useCallback(async (roomId: number) => {
    clearStatus();
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/rooms/${roomId}/messages`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data: unknown = await response.json();

      if (hasApiError(data) && data.error) {
        setErrorStatus(data.error);
        setMessages([]);
        return;
      }

      if (!isMessageArray(data)) {
        throw new Error("Invalid messages response");
      }

      setMessages(data);
    } catch {
      setErrorStatus("Failed to fetch messages");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = async (roomId: number) => {
    clearStatus();

    const trimmedMessage = messageText.trim();

    if (!trimmedMessage) {
      setErrorStatus("Message is required");
      return;
    }

    setIsSendingMessage(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/rooms/${roomId}/messages`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmedMessage }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data: unknown = await response.json();

      if (hasApiError(data) && data.error) {
        setErrorStatus(data.error);
        return;
      }
      if (!isMessage(data)) {
        throw new Error("Invalid Message response");
      }

      setMessageText("");
      setMessages((prev) => [...prev, data ]);

      if (socket) {
        socket.emit("send_message", {
          roomId,
          ...data,
        });
      }
    } catch {
      setErrorStatus("Failed to send message");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const openRoom = (room: Room) => {
    setSelectedRoom(room);
    setMessageText("");
    void fetchMessages(room.id);
  };

  useEffect(() => {
    void fetchRooms();
  }, [fetchRooms]);

  const formatDate = (value: string) => {
    return new Date(value).toLocaleString();
  };

  return (
    <div className="rounded-lg border border-[#cfe0da] bg-white p-5 shadow-md shadow-[#64748b]/10">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[#0f766e]">Rooms</p>
          <span className="rounded-md bg-[#ecfdf5] px-2.5 py-1 text-xs font-bold text-[#047857]">
            Live API
          </span>
        </div>
        <h2 className="mt-2 text-2xl font-bold text-[#111827]">
          {currentUser ? `${currentUser.username}'s rooms` : "Rooms"}
        </h2>
        <p className="text-sm leading-6 text-[#5b6472]">
          Create a room, then use the list as your next message target.
        </p>
      </div>

      <form
        className="mt-5 flex flex-col gap-3 sm:flex-row"
        onSubmit={createRoom}
      >
        <input
          className="h-12 min-w-0 flex-1 rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 text-[#111827] outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-2 focus:ring-[#99f6e4]"
          value={roomName}
          onChange={(event) => setRoomName(event.target.value)}
          placeholder="Room name"
        />
        <button
          className="h-12 rounded-md bg-[#0f766e] px-5 text-sm font-bold text-white shadow-sm shadow-[#0f766e]/25 transition hover:bg-[#115e59] disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={isCreatingRoom}
        >
          {isCreatingRoom ? "Creating..." : "Create"}
        </button>
      </form>

      {statusMessage && (
        <p
          className={
            statusType === "error"
              ? "mt-4 rounded-md border border-[#fecdd3] bg-[#fff1f2] px-3 py-2 text-sm font-medium text-[#be123c]"
              : "mt-4 rounded-md border border-[#bbf7d0] bg-[#ecfdf5] px-3 py-2 text-sm font-medium text-[#065f46]"
          }
        >
          {statusMessage}
        </p>
      )}

      <div className="mt-5">
        <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2">
          <h3 className="text-sm font-bold text-[#111827]">Available rooms</h3>
          <span className="text-xs font-semibold text-[#64748b]">
            {rooms.length} total
          </span>
        </div>

        {rooms.length > 0 ? (
          <ul className="mt-3 grid gap-2">
            {rooms.map((room) => (
              <li
                className={
                  selectedRoom?.id === room.id
                    ? "flex items-center justify-between gap-4 rounded-md border border-[#0f766e] bg-[#ecfdf5] px-4 py-3 transition"
                    : "flex items-center justify-between gap-4 rounded-md border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 transition hover:border-[#0f766e] hover:bg-[#f1f5f7]"
                }
                key={room.id}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-md bg-[#0f766e]" />
                  <span className="truncate font-semibold text-[#111827]">
                    {room.name}
                  </span>
                </span>
                <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-[#64748b]">
                  #{room.id}
                </span>
                <button
                  className="rounded-md border border-[#b7e4db] bg-white px-3 py-2 text-sm font-semibold text-[#0f766e] transition hover:bg-[#f0fdfa]"
                  onClick={() => openRoom(room)}
                  type="button"
                >
                  Open
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 rounded-md border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-3 py-6 text-center text-sm text-[#64748b]">
            No rooms yet.
          </p>
        )}
      </div>

      {selectedRoom &&
        (loading ? (
          <div className="mt-5 rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-4 py-6 text-sm font-medium text-[#64748b]">
            Loading messages...
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-[#d8dde8] bg-[#f8fafc] p-4">
            <div className="flex flex-col gap-3 border-b border-[#e2e8f0] pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0f766e]">
                  Active room
                </p>
                <h3 className="mt-1 text-xl font-bold text-[#111827]">
                  {selectedRoom.name}
                </h3>
                <span className="text-xs text-[#64748b]">
                  {formatDate(selectedRoom.created_at)}
                </span>
              </div>
              <span className="rounded-md bg-white px-3 py-2 text-xs font-bold text-[#64748b]">
                {messages.length} messages
              </span>
            </div>

            <div className="mt-4 max-h-72 overflow-y-auto pr-1">
              {messages.length > 0 ? (
                <ul className="grid gap-3">
                  {messages.map((item) => (
                    <li
                      className="rounded-lg border border-[#e2e8f0] bg-white px-4 py-3 shadow-sm"
                      key={item.id}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-bold text-[#111827]">
                          {item.username}
                        </span>
                        <span className="text-xs font-semibold text-[#94a3b8]">
                          #{item.id}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#334155]">
                        {item.text}
                      </p>
                      <span className="text-xs text-[#94a3b8]">
                        {formatDate(item.created_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-md border border-dashed border-[#cbd5e1] bg-white px-3 py-8 text-center text-sm text-[#64748b]">
                  No messages in this room yet.
                </p>
              )}
            </div>

            <form
              className="mt-4 flex flex-col gap-3 border-t border-[#e2e8f0] pt-4 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();

                if (selectedRoom) {
                  void sendMessage(selectedRoom.id);
                }
              }}
            >
              <input
                className="h-12 min-w-0 flex-1 rounded-md border border-[#cbd5e1] bg-white px-3 text-[#111827] outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#99f6e4]"
                onChange={(event) => setMessageText(event.target.value)}
                placeholder={`Message ${selectedRoom.name}`}
                value={messageText}
              />
              <button
                className="h-12 rounded-md bg-[#173b35] px-5 text-sm font-bold text-white shadow-sm shadow-[#173b35]/25 transition hover:bg-[#0f766e] disabled:cursor-not-allowed disabled:opacity-70"
                type="submit"
                disabled={isSendingMessage}
              >
                {isSendingMessage ? "Sending..." : "Send"}
              </button>
            </form>
          </div>
        ))}
    </div>
  );
};
