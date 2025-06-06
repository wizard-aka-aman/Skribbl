import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as signalR from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  hubConnection!: signalR.HubConnection;

  // baseUrl = 'https://localhost:7263'; // local server as needed
 baseUrl = 'https://hepefek442.bsite.net'; // Global  server as needed
  pen: any
  users: any;
  joinAudio :any= new Audio("https://skribbl.io/audio/join.ogg");
   leaveAudio :any= new Audio("https://skribbl.io/audio/leave.ogg");


  constructor(private http: HttpClient,private toastr: ToastrService, private route: Router) { }
  public async startConnection(groupId: string, user: string,
    onCanvasReceive: (groupId: string, data: any) => void,
    onChatReceive: (user: string, message: string, sentAt: string,timer:number) => void,
    onUserListUpdate: (users: string[]) => void): Promise<void> {

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl}/chatHub?username=${user}`, { withCredentials: true })
      .withAutomaticReconnect()
      .build();
      this.hubConnection.on("UsernameExists", (message: string) => {
      this.toastr.error(`User ${message} is already taken in this group`, 'Error');
      this.route.navigate(['/']);
      console.log(message);
      
    });
    this.hubConnection.on("ReceiveMessage", onCanvasReceive);
    this.hubConnection.on("ReceiveChat", onChatReceive);
    this.hubConnection.on("UserJoined", (userName: string, groupId: string) => {
      console.log(`${userName} joined group ${groupId}`);
      this.joinAudio.play();
      this.GetUsersInGroup(groupId).then(onUserListUpdate);
    });
    this.hubConnection.on("UserLeft", (groupId: string, username: string) => {
      console.log(`${username} left group ${groupId}`);
      this.leaveAudio.play();
      // Optionally remove from UI list of active users
      this.GetUsersInGroup(groupId).then(onUserListUpdate);
    }); 
    this.hubConnection.on("ReceiveDrawer", (drawer: string) => {
    //  console.log(`${drawer} is now drawing!`, "Drawing Turn");
    });

    try {
      await this.hubConnection.start();
      console.log("SignalR Connected.");
      // await this.hubConnection.invoke("JoinGroup", groupId);
      await this.hubConnection.invoke("JoinGroup", groupId, user);
      this.GetUsersInGroup(groupId).then(onUserListUpdate);
      
    } catch (err) {
      console.error("SignalR Connection Error:", err);
    }
  }

  public sendMessage(groupId: string, user: string, message: string, sentAt: string,timer:number) {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke("SendMessage", groupId, user, message, sentAt ,timer);
    }
    // this.saveMessage({ groupName: groupId, sender: user, message })
  }

  public SendCanvas(groupId: string, penmodel: any) {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke("SendCanvas", groupId, penmodel);
    } else {
      console.warn("SignalR not connected. Message not sent.");
    }
  }
  public saveMessage(message: any) {
    return this.http.post(`${this.baseUrl}/api/Chat`, message).subscribe();
  }

  public getMessages(groupId: string) {
    return this.http.get(`${this.baseUrl}/api/Chat/${groupId}`);
  }

  public PersonalChat(groupId: string, sender: string) {
    return this.http.get(`${this.baseUrl}/api/Chat/` + groupId + '/' + sender);
  }
  public broadcastDrawer(groupId: string, drawer: string) {
  if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
    this.hubConnection.invoke("BroadcastDrawer", groupId, drawer);
  }
}

  public GetUsersInGroup(groupId: string): Promise<string[]> { 
      return this.hubConnection.invoke('GetUsersInGroup', groupId) .then((users: string[]) => {
        return users;
      })
      .catch(err => {
        console.error("Error fetching users:", err);
        return [];
      });;
    
  }
  
 
public broadcastTimer(groupId: string, timeLeft: number) {
  if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
    this.hubConnection.invoke("BroadcastTimer", groupId, timeLeft);
  }
}

public broadcastPoints(groupId: string, points: any) {
  if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
    this.hubConnection.invoke("BroadcastPoints", groupId, points);
  }
}

sendWordOptions(groupId: string, drawer: string, words: string[]) {
  if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
    this.hubConnection.invoke("SendWordOptions", groupId, drawer, words);
  }
}

broadcastSelectedWord(groupId: string, word: string) {
  if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
    this.hubConnection.invoke("BroadcastSelectedWord", groupId, word);
  }
}
public broadcastGameStarted(groupId: string) {
  this.hubConnection.invoke("BroadcastGameStarted", groupId)
    .catch(err => console.error("Error broadcasting game start:", err));
}
public broadcastGameEnded(groupId: string , winner: any) {
  this.hubConnection.invoke("BroadcastGameEnded", groupId , winner)
    .catch(err => console.error("Error broadcasting game start:", err));
}
public broadcastRoundEnded(groupId: string , round: string) {
  this.hubConnection.invoke("BroadcastRoundEnded", groupId , round)
    .catch(err => console.error("Error broadcasting Round Ended:", err));
}
public broadcastRoomChanges(groupId: string, timer: number, rounds: number, wordCount: number) {
  this.hubConnection.invoke("BroadcastRoomChanges", groupId, timer, rounds, wordCount)
    .catch(err => console.error("Error broadcasting Room Changes:", err));
}

public broadcastSelectedWordToAll(groupId: string, word: string) {
  this.hubConnection.invoke("BroadcastWordReveal", groupId, word);
}
public BroadcastHint(groupId: string, hint: string[]) {
  this.hubConnection.invoke("BroadcastHint", groupId, hint).catch(err => console.error(err));
}


storeSelectedWord(groupId: string, word: string) {
  this.hubConnection.invoke("StoreSelectedWord", groupId, word);
}

setCurrentDrawer(groupId: string, user: string) {
  this.hubConnection.invoke("SetCurrentDrawer", groupId, user);
}

// api's

public postCreateGroup(form : any){
  return this.http.post(`${this.baseUrl}/api/Game/CreateRoom`, form)
}
public getGroup(name:string){
  return this.http.get(`${this.baseUrl}/api/Game/GetRoom/`+name);
}

public postChangeSetting(form : any , groupId :string){
  return this.http.put(`${this.baseUrl}/api/Game/Update/`+groupId , form);
}

public MapToken(token :any){
  return this.http.post(`${this.baseUrl}/api/Game/map-token`,token);
}


public GetUserFromToken(token:string){
  return this.http.get(`${this.baseUrl}/api/Game/get-user-from-token/`+token);
}

}
