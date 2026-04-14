import React, { useEffect, useState } from "react";

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

export const ChatRooms = ({ currentUser }: ChatRoomProps) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomName, setRoomName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const fetchRooms = () => {
    fetch("http://localhost:3001/api/rooms", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        if(!response.ok){
          throw new Error("Failed to fetch rooms");
        }
      return response.json()})
      .then((rooms) => setRooms(rooms))
      .catch(()=>{
        setStatusMessage("Failed to fetch rooms")
      })
  };

  const createRooms = (e: React.FormEvent<HTMLFormElement>) => {

    
    e.preventDefault();
    const trimmedRoomName = roomName.trim();

    if (!trimmedRoomName) {
      setStatusMessage("Room name is required");
      return;
    }
        setIsCreatingRoom(true)

    fetch("http://localhost:3001/api/rooms", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmedRoomName }),
    })
      .then((response) => {
        if(!response.ok){
          throw new Error("failed to  create rooms")
        }return response.json()
      })
      
      .then((data) => {
        if (data.error) {
          setStatusMessage(data.error);
          setIsCreatingRoom(false)
          return;
        }

        setStatusMessage(`Created room ${data.name}`);
        setRoomName("");
        setIsCreatingRoom(false)
        fetchRooms();
      }).catch(()=>{
        setStatusMessage("Failed to create room")
        setIsCreatingRoom(false)
      })
    
  };

  const fetchMessages = (roomId: number) => {

    fetch(`http://localhost:3001/api/rooms/${roomId}/messages`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) =>{
        if(!response.ok){
          throw new Error ("Failed to fetch messages")
        }
          return response.json()
        })
        
      .then((data) => {
        if (data.error) {
          setStatusMessage(data.error);
         
          return;
        }

        setMessages(data);
    
      }).catch(()=>{
        setStatusMessage("Failed to fetch messages");
   
      })
  };

  const sendMessages = (roomId: number) => {
    if (!messageText.trim()) {
      setStatusMessage("Message is required");
      return;
    }
        setIsSendingMessage(true)
    fetch(`http://localhost:3001/api/rooms/${roomId}/messages`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ text: messageText.trim() }),
    })
      .then((response) => {
        if(!response.ok){
          throw new Error("Failed to send message")
        }
          return response.json()})
  
    
      .then((data) => {
        if (data.error) {
          setStatusMessage(data.error);
           setIsSendingMessage(false)

          return;
        }
        setMessageText("");
           setIsSendingMessage(false)
        fetchMessages(roomId);
      }).catch(()=>{
        setStatusMessage("Failed to send message")
        setIsSendingMessage(false)
      })
  };
  

  const openRoom = (room: Room) => {
    setSelectedRoom(room);
    fetchMessages(room.id);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

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
        onSubmit={createRooms}
      >
        <input
          className="h-12 min-w-0 flex-1 rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 text-[#111827] outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-2 focus:ring-[#99f6e4]"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Room name"
        />
        {isCreatingRoom?(<button
          className="h-12 rounded-md bg-[#0f766e] px-5 text-sm font-bold text-white shadow-sm shadow-[#0f766e]/25 transition hover:bg-[#115e59]"
          type="submit"
          disabled
        >
          Creating
        </button>):(<button
          className="h-12 rounded-md bg-[#0f766e] px-5 text-sm font-bold text-white shadow-sm shadow-[#0f766e]/25 transition hover:bg-[#115e59]"
          type="submit"
        >
          Create
        </button>)}
        
      </form>

      {statusMessage && (
        <p className="mt-4 rounded-md border border-[#bbf7d0] bg-[#ecfdf5] px-3 py-2 text-sm font-medium text-[#065f46]">
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
                key={room?.id}
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
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-[#0f766e] border border-[#b7e4db] transition hover:bg-[#f0fdfa]"
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
      {selectedRoom && (
        <div className="mt-5 rounded-lg border border-[#d8dde8] bg-[#f8fafc] p-4">
          <div className="flex flex-col gap-3 border-b border-[#e2e8f0] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0f766e]">
                Active room
              </p>
              <h3 className="mt-1 text-xl font-bold text-[#111827]">
                {selectedRoom.name}
              </h3>
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
            onSubmit={(e) => {
              e.preventDefault();
              if (selectedRoom) {
                sendMessages(selectedRoom.id);
              }
            }}
          >
            <input
              className="h-12 min-w-0 flex-1 rounded-md border border-[#cbd5e1] bg-white px-3 text-[#111827] outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#99f6e4]"
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={`Message ${selectedRoom.name}`}
              value={messageText}
            />
            {isSendingMessage?(<button
              className="h-12 rounded-md bg-[#173b35] px-5 text-sm font-bold text-white shadow-sm shadow-[#173b35]/25 transition hover:bg-[#0f766e]"
              type="submit"
              disabled
            >
              Sending...
            </button>):(<button
              className="h-12 rounded-md bg-[#173b35] px-5 text-sm font-bold text-white shadow-sm shadow-[#173b35]/25 transition hover:bg-[#0f766e]"
              type="submit"
            >Send</button>)}
            
          </form>
        </div>
      )}
    </div>
  );
};
