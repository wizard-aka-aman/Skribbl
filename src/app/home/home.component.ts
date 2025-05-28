import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgWhiteboardComponent, WhiteboardElement, WhiteboardOptions } from 'ng-whiteboard';
import { NgWhiteboardService } from 'ng-whiteboard';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceService } from '../service.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-home',
  imports: [NgWhiteboardComponent, CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  whiteboardOptions: WhiteboardOptions = {
    backgroundColor: 'rgb(224, 224, 224)',
    strokeColor: '#000',
    strokeWidth: 2,
    canvasHeight: 400,
    canvasWidth: 600
  };
  data: any;
  groupId: string = '';
  group: any;
  user: string = '';
  messages: any[] = [];
  message = '';
  naam: any;
  chats: any[] = [];
  activeUsers: string[] = [];
  randomWords: string[] = [
    "chair", "table", "book", "pen", "notebook", "laptop", "keyboard", "mouse", "monitor", "phone",
    "television", "remote", "sofa", "lamp", "fan", "air conditioner", "heater", "refrigerator", "microwave", "oven",
    "stove", "dishwasher", "sink", "toilet", "bathtub", "shower", "towel", "toothbrush", "toothpaste", "mirror",
    "comb", "hairdryer", "shampoo", "soap", "bed", "pillow", "blanket", "wardrobe", "hanger", "clock",
    "calendar", "window", "curtain", "door", "doormat", "shoe", "sock", "shirt", "pants", "jacket",
    "hat", "scarf", "glove", "belt", "watch", "wallet", "bag", "backpack", "bottle", "glass",
    "cup", "plate", "bowl", "fork", "knife", "spoon", "napkin", "pan", "pot", "ladle",
    "broom", "mop", "bucket", "vacuum", "duster", "bin", "newspaper", "magazine", "letter", "stamp",
    "envelope", "scissors", "tape", "glue", "stapler", "paper", "printer", "scanner", "calculator", "ruler",
    "eraser", "sharpener", "chalk", "board", "projector", "screen", "speaker", "microphone", "tripod", "camera",
    "photo", "painting", "poster", "flag", "plant", "flower", "tree", "grass", "rock", "sand",
    "cloud", "sun", "moon", "star", "rain", "snow", "umbrella", "boots", "car", "bus",
    "bicycle", "motorcycle", "truck", "train", "tram", "subway", "aeroplane", "helicopter", "boat", "ship",
    "bridge", "road", "highway", "traffic light", "sign", "crosswalk", "sidewalk", "building", "skyscraper", "house",
    "apartment", "fence", "gate", "garage", "mailbox", "bench", "statue", "fountain", "swing", "slide",
    "ladder", "toolbox", "hammer", "screwdriver", "wrench", "drill", "saw", "nail", "screw", "tape measure",
    "paint", "brush", "roller", "canvas", "easel", "palette", "crayon", "marker", "highlighter", "whiteboard",
    "chalkboard", "clipboard", "helmet", "glasses", "goggles", "mask", "first aid kit", "bandage", "thermometer", "medicine"
  ]
  activeUsersChanges: any = {};
  isStarted: boolean = false
  whoDraw: string = ""
  timer: number = 0;
  counting: any;
  groupTimer: number = 5;
  groupPoints: any = {};
  @ViewChild('modalbtn') modalbtn!: ElementRef<HTMLDivElement>;
  selectedRandomWords: string[] = [];
  userSelectedWord: string = ""
  winnerModalVisible = false;
  winner: any = null;
  isUserGuess: boolean = false;
  showWordSelectionModal: boolean = false;
  CreatedBy: string = ""
  round: number = 1;
  totalRound: number = 0;
  guessWordLength: number = 0
  guessedUsers: Set<string> = new Set(); 
   playerGuessedAudio :any= new Audio("https://skribbl.io/audio/playerGuessed.ogg");
   tickAudio :any= new Audio("https://skribbl.io/audio/tick.ogg");
   roundStartAudio :any= new Audio("https://skribbl.io/audio/roundStart.ogg");
   roundEndSuccessAudio :any= new Audio("https://skribbl.io/audio/roundEndSuccess.ogg");
   



  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLDivElement>;
  @ViewChild(NgWhiteboardComponent) whiteboard!: NgWhiteboardComponent;
  constructor(private router: ActivatedRoute, private toastr: ToastrService, private whiteboardService: NgWhiteboardService, private serviceSrv: ServiceService) {

    this.router.queryParams.subscribe(param => {
      this.groupId = (param['groupId']);
      this.user = (param['user']);
      console.log(this.groupId);
      this.naam = this.groupId
    })
    console.log(this.user);
    console.log(this.groupId);

    this.serviceSrv.getGroup(this.groupId).subscribe((res: any) => {
      this.group = res[0];
      console.log(res);
      console.log(this.group.timer);
      this.CreatedBy = this.group.createdBy
      console.log(this.CreatedBy);

      this.groupTimer = this.group.timer;
      this.totalRound = this.group.rounds
      console.log(this.totalRound);

    })

  }

  async ngOnInit(): Promise<void> {
    await this.serviceSrv.startConnection(
      this.groupId,
      this.user,
      (groupId, data) => {

        const currentUserent = this.whiteboard.data || [];
        this.whiteboard.data = [...currentUserent, ...data];
      },
      (user: string, message: string, sentAt: string) => {
        this.chats.push({ sender: user, message, sentAt });
        console.log(this.chats);

        setTimeout(() => {
          const el = this.chatContainer.nativeElement;
          el.scrollTop = el.scrollHeight;
        }, 10);
      },
      (users: string[]) => {
        this.activeUsers = users;
        console.log("Active users updated:", users);

      },

    );

    try {
      this.activeUsers = await this.serviceSrv.GetUsersInGroup(this.groupId);
      console.log(this.activeUsers);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }

    this.serviceSrv.getMessages(this.groupId).subscribe((msgs: any) => {
      this.chats = msgs;
    });

    // 👇 ADD THIS: receive who is drawing
    this.serviceSrv.hubConnection.on("ReceiveDrawer", (drawer: string) => {
      this.selectedRandomWords = []
      this.clearBoard();
      this.userSelectedWord = ""
      this.isUserGuess = false
      this.selectedRandomWords = this.getUniqueRandomWords(this.group.wordCount);
      console.log(this.selectedRandomWords);

      if (this.user == drawer) {
        this.showWordSelectionModal = true;
      }
      this.toastr.info(`${drawer} is now drawing!`, "Drawing Turn");


      this.whoDraw = drawer; // update who can draw
    });
    this.serviceSrv.hubConnection.on("ReceiveTimer", (timeLeft: number) => {
      this.groupTimer = timeLeft;
      if(timeLeft < 10){
        this.tickAudio.play();
      }
    });

    this.serviceSrv.hubConnection.on("ReceivePoints", (points: any) => {
      this.groupPoints = points;
    });
    this.serviceSrv.hubConnection.on("ReceiveRoundEnded", (round: string) => {
      this.round++;
      this.toastr.info(`${round} has ended!`, "Round Update");
      this.roundEndSuccessAudio.play();
    });

    this.serviceSrv.hubConnection.on("ReceiveGameStarted", () => {
      this.isStarted = true; // Hide the Start button
      this.toastr.info("Game has been started!", "Started");
      this.roundStartAudio.play();
    });
    this.serviceSrv.hubConnection.on("ReceiveGameEnded", (winner: any) => {
      this.winnerModalVisible = true; // Hide the Start button
      this.winner = winner;
      this.isStarted = false;
      this.serviceSrv.setCurrentDrawer(this.groupId, "");
      this.whoDraw = "";
      this.toastr.info("Game has been Ended!", "Started");
      
    });
    this.serviceSrv.hubConnection.on("ReceiveSelectedWord", (word: string) => {
      this.guessWordLength = word.length;
      // this.toastr.info("Word!", word);
    });


    this.serviceSrv.hubConnection.on("UserGuessedWord", (guesser: string, drawer: string, word: string) => {
  this.playerGuessedAudio.play();
      this.toastr.success(`${guesser} guessed the word!`, "Correct Guess");
      if (this.user == guesser) {
        this.isUserGuess = true;
      }

      this.guessedUsers.add(guesser)
      // Optional: increase drawer's points
      const drawerObj = this.activeUsersChanges.find((u: any) => u.user === guesser);
      if (drawerObj) {
        drawerObj.points += 1;
        
        this.groupPoints = [...this.activeUsersChanges ,];
        this.serviceSrv.broadcastPoints(this.groupId, this.groupPoints);
      }
      // Check if all users except the drawer have guessed
      const usersToGuess = this.activeUsers.filter(u => u !== drawer);
      console.log(usersToGuess);
      
      const allGuessed = usersToGuess.every(user => this.guessedUsers.has(user));
      console.log(allGuessed);
      console.log(this.guessedUsers);
      

      if (allGuessed) {
        // Clear the guessed users set for the next round
        this.guessedUsers.clear();

        // Stop current timer interval (if running)
        if (this.counting) {
          clearInterval(this.counting);
          this.timer = this.group.timer;
          this.serviceSrv.broadcastTimer(this.groupId, this.timer);
        }

        // Move to next drawer
        this.nextDrawer();
      }

    });


    setTimeout(() => {
      const el = this.chatContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }, 250);

  }



  onDataChange(data: WhiteboardElement[]) {
    this.data = data;
    // console.log(this.data);
  }

  clearBoard() {
    this.data = this.whiteboardService.clear();
    setTimeout(() => {

      this.send()
    }, 100);
  }
  Undo() {
    this.whiteboardService.undo();
    setTimeout(() => {
      this.send()
    }, 100);
  }

  send() {
    this.serviceSrv.SendCanvas(this.groupId, this.data);
  }

  sendchat() {
    const sentAt = new Date().toLocaleString();
    console.log(this.userSelectedWord);

    if (this.message.trim()) {
      this.serviceSrv.sendMessage(this.groupId, this.user, this.message, sentAt);
      console.log({ groupid: this.groupId, user: this.user, message: this.message, sent: sentAt });
      this.message = '';
    }
    setTimeout(() => {
      const el = this.chatContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }, 50);
  }
  start() {

    console.log(this.activeUsers);
    console.log((Math.random() * 100).toFixed(0));
    console.log(this.randomWords[Number.parseInt((Math.random() * 100).toFixed(0))]);
    this.selectedRandomWords = [];
    this.clearBoard();
    this.round = 1;
    this.userSelectedWord = ""
    this.selectedRandomWords = this.getUniqueRandomWords(this.group.wordCount);
    if (this.activeUsers.length < 2) {
      this.toastr.warning("Cannot start a room with less than 2 Users !", "Warning")
      return;
    }
    this.serviceSrv.broadcastGameStarted(this.groupId); // 👈 Call this
    

    if (Object.keys(this.activeUsersChanges).length === 0) {
      this.activeUsersChanges = this.activeUsers.map((e: any) => ({
        user: e,
        isDrawing: false,
        counter: this.group.rounds,
        points: 0
      }))
    } else {
      for (let key in this.activeUsersChanges) {
        this.activeUsersChanges[key].isDrawing = false;
        this.activeUsersChanges[key].counter = this.group.rounds
      }
    }

    console.log(this.activeUsersChanges);
    this.groupPoints = this.activeUsersChanges;
    this.isStarted = true;
    this.serviceSrv.broadcastPoints(this.groupId, this.activeUsersChanges); // 🔁 update everyone
    
    this.nextDrawer();

  }
  nextDrawer() {
    const currentUser = this.activeUsersChanges.find((u: any) => !u.isDrawing);
    const changeisDrawingToFalse = this.activeUsersChanges.find((u: any) => u.counter != 0);
    console.log(currentUser);

    if (!currentUser) {
      if (changeisDrawingToFalse) {
        const roundMessage = `Round ${this.group.rounds - changeisDrawingToFalse.counter}`;
        this.serviceSrv.broadcastRoundEnded(this.groupId, roundMessage);
        this.activeUsersChanges.forEach((user: any) => user.isDrawing = false);
        this.nextDrawer();
        return;

      }
      // this.toastr.info("All users have drawn once!", "Info");
      this.isStarted = false
      this.showWinnerModal();
      console.log(this.groupPoints);
      
      return;
    }
    currentUser.isDrawing = true;

    currentUser.counter--;

    this.whoDraw = currentUser.user;
    // 📡 Optional: Send this info to all group members via SignalR
    this.serviceSrv.broadcastDrawer(this.groupId, currentUser.user);
    this.timer = this.group.timer
    this.counting = setInterval(() => {
      this.timer--;
      this.serviceSrv.broadcastTimer(this.groupId, this.timer); // 🔁 real-time update
      console.log(this.timer);
      
      if (this.timer == 0) {
        clearInterval(this.counting);
        this.timer = this.group.timer;
        this.serviceSrv.broadcastPoints(this.groupId, this.activeUsersChanges); // 🔁 update everyone
        console.log(this.groupPoints);
        //  this.selectedRandomWords = []  
        this.nextDrawer();
        return;
      }
    }, 1000)


  }



  selectedRandomWord(word: string) {
    this.userSelectedWord = word;
    this.showWordSelectionModal = false; // 👈 Hide modal
    console.log("Selected word:", this.userSelectedWord);

    // Optional: Broadcast the word selection
    this.serviceSrv.broadcastSelectedWord(this.groupId, this.userSelectedWord);
    this.serviceSrv.storeSelectedWord(this.groupId, word); // ✅ store word
    this.serviceSrv.setCurrentDrawer(this.groupId, this.user); // ✅ store drawer

  }

  showWinnerModal() {  // 👀 Show winner modal
    this.winner = this.groupPoints.sort((a:any,b:any)=> b.points - a.points);
    this.winner = this.winner.slice(0,3);
    this.winnerModalVisible = true;
    console.log(this.winner);
    console.log(this.groupPoints);
    
    
    this.serviceSrv.broadcastGameEnded(this.groupId, this.winner);
  }

  restartGame() {
    this.winnerModalVisible = false;

  }

  getUniqueRandomWords(numberOfWords: number): string[] {

    // Shuffle the words array using Fisher-Yates shuffle
    const shuffled = [...this.randomWords];
    for (let i = shuffled.length - 1; i > 0; i--) {
      console.log("hehe");

      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Return first 5 unique words
    return shuffled.slice(0, numberOfWords);
  }

}

