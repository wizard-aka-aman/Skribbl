import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  hubConnection!: signalR.HubConnection;

  baseUrl = 'https://localhost:7263'; // local server as needed
  pen: any
  users: any;
  constructor(private http: HttpClient) { }
  public async startConnection(groupId: string, user: string,
    onCanvasReceive: (groupId: string, data: any) => void,
    onChatReceive: (user: string, message: string, sentAt: string) => void,
    onUserListUpdate: (users: string[]) => void): Promise<void> {

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl}/chatHub?username=${user}`, { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on("ReceiveMessage", onCanvasReceive);
    this.hubConnection.on("ReceiveChat", onChatReceive);
    this.hubConnection.on("UserJoined", (userName: string, groupId: string) => {
      console.log(`${userName} joined group ${groupId}`);
      this.GetUsersInGroup(groupId).then(onUserListUpdate);
    });
    this.hubConnection.on("UserLeft", (groupId: string, username: string) => {
      console.log(`${username} left group ${groupId}`);
      // Optionally remove from UI list of active users
      this.GetUsersInGroup(groupId).then(onUserListUpdate);
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

  public sendMessage(groupId: string, user: string, message: string, sentAt: string) {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke("SendMessage", groupId, user, message, sentAt);
    }
    this.saveMessage({ groupName: groupId, sender: user, message })
  }

  public SendCanvas(groupId: string, penmodel: any) {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke("SendCanvas", groupId, penmodel);
    } else {
      console.warn("SignalR not connected. Message not sent.");
    }
  }
  private saveMessage(message: any) {
    return this.http.post(`${this.baseUrl}/api/Chat`, message).subscribe();
  }

  public getMessages(groupId: string) {
    return this.http.get(`${this.baseUrl}/api/Chat/${groupId}`);
  }

  public PersonalChat(groupId: string, sender: string) {
    return this.http.get(`${this.baseUrl}/api/Chat/` + groupId + '/' + sender);
  }
  GetUsersInGroup(groupId: string): Promise<string[]> {
    return this.hubConnection.invoke('GetUsersInGroup', groupId) .then((users: string[]) => {
      return users;
    })
    .catch(err => {
      console.error("Error fetching users:", err);
      return [];
    });;
  }
}
