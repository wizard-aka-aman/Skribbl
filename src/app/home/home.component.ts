import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NgWhiteboardComponent, WhiteboardElement, WhiteboardOptions } from 'ng-whiteboard';
import { NgWhiteboardService } from 'ng-whiteboard';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceService } from '../service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {ToolType} from 'ng-whiteboard'
@Component({
  selector: 'app-home',
  imports: [NgWhiteboardComponent, CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  whiteboardOptions: WhiteboardOptions = {
    backgroundColor: 'rgb(224, 224, 224)', 
    strokeColor: '#000',
    strokeWidth: 2,
    canvasHeight: 400,
    canvasWidth: 600, 

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
  playerGuessedAudio: any = new Audio("https://skribbl.io/audio/playerGuessed.ogg");
  tickAudio: any = new Audio("https://skribbl.io/audio/tick.ogg");
  roundStartAudio: any = new Audio("https://skribbl.io/audio/roundStart.ogg");
  roundEndSuccessAudio: any = new Audio("https://skribbl.io/audio/roundEndSuccess.ogg");
  wordCount: number = 0;
  postRoomBody: any = {};
  posttimer: number = 0;
  postrounds: number = 0;
  postwordCount: number = 0;
  token: string = "";
  hint: string[] = [];
  hintTimer: number = 0;
  hintwordLength: number = 0
  randomNumberForHint: any;
  correctedWord: string[] = []
  previousActiveUsers: any;
  Strokecolor : string = ""
  strokeWidth : number = 2
  selectedElements: WhiteboardElement[] = [];
  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLDivElement>;
  @ViewChild(NgWhiteboardComponent) whiteboard!: NgWhiteboardComponent;
  $index: any;
  constructor(private router: ActivatedRoute, private toastr: ToastrService, private whiteboardService: NgWhiteboardService, private serviceSrv: ServiceService, private route: Router) {
 
    

    this.router.queryParams.subscribe(param => {
      this.groupId =  (param['groupId']);
      this.token = (param['token']);
      // console.log(this.groupId);
      // console.log(this.token);
      this.naam = this.groupId
    })
    this.serviceSrv.GetUserFromToken(this.token).subscribe({
      next: async (res: any) => {
        // console.log(res);
        // console.log(res.user);
        this.user = res.user;
        this.StartGame();
      },
      error: (err: any) => {
        // console.log(err);
        this.toastr.error("token changed or invalid", "error");
        this.route.navigate(['/']);
      }
    })
    // console.log(this.user);
    // console.log(this.groupId);

    this.serviceSrv.getGroup(this.groupId).subscribe((res: any) => {
      this.group = res[0];
      // console.log(res);
      // console.log(this.group.timer);
      this.CreatedBy = this.group.createdBy
      // console.log(this.CreatedBy);

      this.groupTimer = this.group.timer;
      this.totalRound = this.group.rounds;
      this.wordCount = this.group.wordCount
      // console.log(this.totalRound);
      this.posttimer = this.groupTimer;
      this.postrounds = this.totalRound;
      this.postwordCount = this.wordCount;
    })
    document.addEventListener("keydown", ({ key }) => {
      let keys: string = key;
      switch (keys) {
        case "u":
          if (!(this.whoDraw != this.user))
            this.Undo();
          break;
        case "c":
          if (!(this.whoDraw != this.user))
            this.clearBoard();
          break;
      }
    });


  }

  async StartGame() {

    await this.serviceSrv.startConnection(
      this.groupId,
      this.user,
      (groupId, data) => {

        const currentUserent = this.whiteboard.data || [];
        //console.log(this.data); 
        // console.log(data);


        this.whiteboard.data = [...data];
        // this.whiteboard.data =[...currentUserent , data[this.data.length-1]] ;
      },
      (user: string, message: string, sentAt: string, timer: number) => {

        this.chats.push({
          sender: user,
          message: message,
          sentAt: sentAt,
          type: 'chat',
          timer: timer
        });
        // this.chats.push({ sender: user, message, sentAt });
        // console.log(this.chats);

        setTimeout(() => {
          const el = this.chatContainer.nativeElement;
          el.scrollTop = el.scrollHeight;
        }, 250);
      },
      (users: string[]) => {
        this.activeUsers = users;
        this.activeUsers = this.activeUsers.sort()
        // console.log("Active users updated:", users);

      },


    );


    try {
      this.activeUsers = await this.serviceSrv.GetUsersInGroup(this.groupId);
      this.activeUsers = this.activeUsers.sort()
      // console.log(this.activeUsers);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }


    this.serviceSrv.getMessages(this.groupId).subscribe((msgs: any) => {
      this.chats = msgs;
      setTimeout(() => {
        const el = this.chatContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }, 250);
    });

    // 👇 ADD THIS: receive who is drawing
    this.serviceSrv.hubConnection.on("ReceiveDrawer", (drawer: string) => {

      this.selectedRandomWords = []
      this.clearBoard();
      // console.log(this.userSelectedWord);
      this.serviceSrv.broadcastSelectedWord(this.groupId, "");
      this.userSelectedWord = ""
      this.hintwordLength = 0
      this.hint = []
      this.isUserGuess = false
      this.guessedUsers.clear();
      this.selectedRandomWords = this.getUniqueRandomWords(this.wordCount);
      // console.log(this.selectedRandomWords);

      if (this.user == drawer) {
        this.showWordSelectionModal = true;
      }
      this.toastr.info(`${drawer} is now drawing!`, "Drawing Turn");


      this.whoDraw = drawer; // update who can draw
    });
    this.serviceSrv.hubConnection.on("ReceiveTimer", (timeLeft: number) => {
      this.groupTimer = timeLeft;
      if (timeLeft < 10) {
        this.tickAudio.play();
      }
    });
    this.serviceSrv.hubConnection.on("ReceiveHint", (serverHint: string[]) => {
      // console.log("Received hint from server:", serverHint);

      if (!serverHint || serverHint.length === 0) return;

      // Don't mutate the server-sent hint directly
      const hintCopy = [...serverHint];

      // Assign to component state
      this.hint = hintCopy;

      // Guard against missing values
      if (
        !this.correctedWord ||
        this.correctedWord.length === 0 ||
        !this.userSelectedWord ||
        this.userSelectedWord.length === 0 ||
        !this.randomNumberForHint ||
        this.hintwordLength >= this.randomNumberForHint.length
      ) {
        // console.warn("State not properly initialized for hint update");
        return;
      }

      // Avoid divide-by-zero
      let perTimehint = Math.max(1, Math.round(this.posttimer / this.userSelectedWord.length)) * 2;
      let starting = this.randomNumberForHint[this.hintwordLength];

      if (this.groupTimer % perTimehint === 0) {
        hintCopy[starting] = this.correctedWord[starting];
        this.hintwordLength++;

        // Save the updated hint
        this.hint = hintCopy;

        // console.log("Updated hint: ", this.hint);
      }
    });



    this.serviceSrv.hubConnection.on("ReceivePoints", (points: any) => {
      this.groupPoints = points;
      this.groupPoints.sort((a: any, b: any) => b.points - a.points)
    });
    this.serviceSrv.hubConnection.on("ReceiveRoundEnded", (round: string) => {
      if (this.totalRound > this.round) {
        this.round++;
      }
      this.toastr.info(`${round} has ended!`, "Round Update");
      this.roundEndSuccessAudio.play();
    });

    this.serviceSrv.hubConnection.on("ReceiveGameStarted", () => {
      this.isStarted = true; // Hide the Start button
      this.toastr.info("Game has been started!", "Started");
      this.round = 1;
      this.roundStartAudio.play();
    });

    this.serviceSrv.hubConnection.on("ReceiveRoomChanges", (timer: number, rounds: number, wordCount: number) => {
      this.groupTimer = timer;
      this.totalRound = rounds;
      this.wordCount = wordCount;
      this.toastr.info("Room settings updated!", "Settings Changed");
    });


    this.serviceSrv.hubConnection.on("ReceiveGameEnded", (winner: any) => {
      this.winnerModalVisible = true; // Hide the Start button
      this.winner = winner;
      this.isStarted = false;
      this.serviceSrv.setCurrentDrawer(this.groupId, "");
      this.whoDraw = "";
      this.isUserGuess = false
      this.toastr.info("Game has been Ended!", "Started");

    });
    this.serviceSrv.hubConnection.on("ReceiveSelectedWord", (word: string) => {
      this.guessWordLength = word.length;
      this.userSelectedWord = word;
      this.hint = this.generateUnderscoreHint(word.length);
      this.correctedWord = Array.from(word);
      // this.toastr.info("Word!", word);
    });



    this.serviceSrv.hubConnection.on("UserGuessedWord", (guesser: string, drawer: string, word: string, timer: number) => {
      this.playerGuessedAudio.play();

      this.chats.push({
        sender: 'System',
        message: `🎉 ${guesser} guessed the word!`,
      });

      setTimeout(() => {
        const el = this.chatContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }, 250);
      if (this.user == guesser) {
        this.isUserGuess = true;
      }

      this.guessedUsers.add(guesser)
      // Optional: increase drawer's points
      const guesserObj = this.activeUsersChanges.find((u: any) => u.user === guesser);
      const drawerObj = this.activeUsersChanges.find((u: any) => u.user === drawer);
      if (drawerObj) {

        if (this.guessedUsers.size == 1) {
          drawerObj.points += 100;
        }
        drawerObj.points += 50;

      }
      if (guesserObj) {
        var maxTimer = this.posttimer;
        var timeBonus = ((timer / maxTimer) * 100);
        // console.log("timeBonus"+ timeBonus);

        guesserObj.points += timeBonus;
        guesserObj.points += 50; // base point


        if (this.guessedUsers.size == 1) {
          guesserObj.points += 75;
        }
        else if (this.guessedUsers.size == 2) {
          guesserObj.points += 50;
        }
        else if (this.guessedUsers.size == 3) {
          guesserObj.points += 25;
        }
        else {
          guesserObj.points += 5;
        }
        // console.log(guesserObj.points);

        guesserObj.points = Math.round(guesserObj.points)

        this.groupPoints = [...this.activeUsersChanges,];
        this.serviceSrv.broadcastPoints(this.groupId, this.groupPoints);
      }
      // Check if all users except the drawer have guessed
      const usersToGuess = this.activeUsers.filter(u => u !== drawer);
      // console.log(usersToGuess);

      const allGuessed = usersToGuess.every(user => this.guessedUsers.has(user));
      // console.log(allGuessed);
      // console.log(this.guessedUsers);


      if (allGuessed) {
        // Clear the guessed users set for the next round
        this.guessedUsers.clear();

        // Stop current timer interval (if running)
        if (this.counting) {
          clearInterval(this.counting);
          this.timer = this.posttimer;
          this.serviceSrv.broadcastTimer(this.groupId, this.timer);
        }

        // Move to next drawer
        this.nextDrawer();
      }

    });


    this.serviceSrv.hubConnection.on("ReceiveWordReveal", (word: string) => {
      this.chats.push({
        sender: 'System',
        message: `⏰ Time's up! The word was: ${word}`,
      });
      setTimeout(() => {
        const el = this.chatContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }, 250);
    });
  }


 @Output() dataChange = new EventEmitter<WhiteboardElement[]>();
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
  
  selectElements(elements: WhiteboardElement[]) {
    console.log('🚀 ~ ComprehensiveComponent ~ selectElements ~ elements:', elements);
    this.selectedElements = elements;
  } 
  updateSelectedElement(partialElement: Partial<WhiteboardElement>) {
    this.whiteboardService.updateSelectedElements(partialElement);
  }
  selectedTool: ToolType = ToolType.Pen;
  Undo() {
    
    this.whiteboardService.undo();  
    
    
    setTimeout(() => {
      this.send()
    }, 100);
  }

  OtherFeaturesOnCanvas() {
  }
  send() {
    this.serviceSrv.SendCanvas(this.groupId, this.data); 
    
  }

  sendchat() {
    const sentAt = new Date().toLocaleString();
    // console.log(this.userSelectedWord);

    if (this.message.trim()) {
      // console.log(this.timer);

      this.serviceSrv.sendMessage(this.groupId, this.user, this.message, sentAt, this.groupTimer);
      // console.log({ groupid: this.groupId, user: this.user, message: this.message, sent: sentAt ,timer:this.groupTimer});
      this.message = '';
    }
    setTimeout(() => {
      const el = this.chatContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }, 250);
  }
  start() {
    // console.log(this.group);
    // console.log(this.postrounds);


    this.selectedRandomWords = [];
    this.clearBoard();
    this.round = 1;
    this.userSelectedWord = ""
    this.selectedRandomWords = this.getUniqueRandomWords(this.wordCount);
    if (this.activeUsers.length < 2) {
      this.toastr.warning("Cannot start a room with less than 2 Users !", "Warning")
      return;
    }
    this.serviceSrv.broadcastGameStarted(this.groupId); // 👈 Call this

    const hasUserListChanged = JSON.stringify(this.activeUsers) !== JSON.stringify(this.previousActiveUsers);


    if (Object.keys(this.activeUsersChanges).length === 0 || hasUserListChanged || !this.activeUsersChanges) {
      this.activeUsersChanges = this.activeUsers.map((e: any) => ({
        user: e,
        isDrawing: false,
        counter: this.postrounds,
        points: 0
      }))
      this.previousActiveUsers = [...this.activeUsers]; // Update snapshot
    } else {
      for (let key in this.activeUsersChanges) {
        this.activeUsersChanges[key].isDrawing = false;
        this.activeUsersChanges[key].counter = this.postrounds
      }
    }

    // console.log(this.activeUsersChanges);
    this.groupPoints = this.activeUsersChanges;
    this.isStarted = true;
    this.serviceSrv.broadcastPoints(this.groupId, this.activeUsersChanges); // 🔁 update everyone

    this.nextDrawer();

  }
  nextDrawer() {
    const currentUser = this.activeUsersChanges.find((u: any) => !u.isDrawing);
    const changeisDrawingToFalse = this.activeUsersChanges.find((u: any) => u.counter != 0);
    // console.log(currentUser);

    if (!currentUser) {
      if (changeisDrawingToFalse) {
        const roundMessage = `Round ${this.postrounds - changeisDrawingToFalse.counter}`;
        this.serviceSrv.broadcastRoundEnded(this.groupId, roundMessage);
        this.activeUsersChanges.forEach((user: any) => user.isDrawing = false);
        this.nextDrawer();
        return;

      }
      // this.toastr.info("All users have drawn once!", "Info");
      this.isStarted = false
      this.showWinnerModal();
      this.clearBoard();
      // console.log(this.groupPoints);

      return;
    }
    currentUser.isDrawing = true;

    currentUser.counter--;

    this.whoDraw = currentUser.user;
    // 📡 Optional: Send this info to all group members via SignalR
    this.serviceSrv.broadcastDrawer(this.groupId, currentUser.user);
    this.timer = this.posttimer
    this.counting = setInterval(() => {
      this.timer--;
      if (this.hint != undefined)
        this.serviceSrv.BroadcastHint(this.groupId, this.hint);
      this.serviceSrv.broadcastTimer(this.groupId, this.timer); // 🔁 real-time update

      // console.log(this.timer);

      if (this.timer == 0) {
        clearInterval(this.counting);
        this.timer = this.posttimer;
        // console.log("in settimeout " + this.userSelectedWord);

        this.serviceSrv.BroadcastHint(this.groupId, []);
        this.serviceSrv.broadcastSelectedWordToAll(this.groupId, this.userSelectedWord);
        this.serviceSrv.broadcastPoints(this.groupId, this.activeUsersChanges); // 🔁 update everyone
        // console.log(this.groupPoints);
        //  this.selectedRandomWords = []  
        this.nextDrawer();
        return;
      }
    }, 1000)


  }



  selectedRandomWord(word: string) {
    this.userSelectedWord = word;
    this.showWordSelectionModal = false; // 👈 Hide modal
    this.clearBoard();
    // console.log("Selected word:", this.userSelectedWord);

    // Optional: Broadcast the word selection
    this.serviceSrv.broadcastSelectedWord(this.groupId, this.userSelectedWord);
    this.serviceSrv.storeSelectedWord(this.groupId, word); // ✅ store word
    this.serviceSrv.setCurrentDrawer(this.groupId, this.user); // ✅ store drawer
    this.randomNumberForHint = this.generateUniqueRandomNumbers(0, this.userSelectedWord.length - 1)

  }

  showWinnerModal() {  // 👀 Show winner modal
    this.winner = this.groupPoints.sort((a: any, b: any) => b.points - a.points);
    this.winner = this.winner.slice(0, 3);
    this.winnerModalVisible = true;
    // console.log(this.winner);
    // console.log(this.groupPoints);


    this.serviceSrv.broadcastGameEnded(this.groupId, this.winner);
  }

  restartGame() {
    this.winnerModalVisible = false;

  }

  getUniqueRandomWords(numberOfWords: number): string[] {

    // Shuffle the words array using Fisher-Yates shuffle
    const shuffled = [...this.randomWords];
    for (let i = shuffled.length - 1; i > 0; i--) {
      // console.log("hehe");

      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Return first 5 unique words
    return shuffled.slice(0, numberOfWords);
  }


  postChangeSetting() {
    if (this.posttimer <= 0 || this.postrounds <= 0 || this.postwordCount <= 0) {
      this.toastr.error("Can't be negative or zero", "Error");
      this.posttimer = this.groupTimer;
      this.postrounds = this.totalRound;
      this.postwordCount = this.wordCount;
      return;
    }
    this.postRoomBody.timer = this.posttimer;
    this.postRoomBody.rounds = this.postrounds;
    this.postRoomBody.WordCount = this.postwordCount;
    this.postRoomBody.RoomName = this.groupId;
    this.postRoomBody.CreatedBy = this.user;
    // console.log(this.postRoomBody);
    this.serviceSrv.postChangeSetting(this.postRoomBody, this.groupId).subscribe({
      next: (res: any) => {
        // Broadcast the new settings to everyone
        this.serviceSrv.broadcastRoomChanges(
          this.groupId,
          res[0].timer,
          res[0].rounds,
          res[0].wordCount
        );

        // Also update self
        this.groupTimer = res[0].timer;
        this.totalRound = res[0].rounds;
        this.wordCount = res[0].wordCount;
      },
      error: (err: any) => {
        this.toastr.error("Error Happened", "Error");
        console.error(err);
      }
    });
  }
  copygroupId() {
    if (this.groupId) {
      navigator.clipboard.writeText(this.groupId);
      this.toastr.success("Room ID copied to clipboard!", "Success")
    }
  }
  generateUniqueRandomNumbers(min: number, max: number): number[] {
    const uniqueNumbers = new Set<number>();

    while (uniqueNumbers.size < (max - min + 1)) {
      const rand = Math.floor(Math.random() * (max - min + 1)) + min;
      uniqueNumbers.add(rand);
    }

    return Array.from(uniqueNumbers);
  }
  generateUnderscoreHint(length: number): string[] {
    return Array(length).fill('_');
  }

}

