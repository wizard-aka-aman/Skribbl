# Skribbl

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.0.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

✅ Core Features You’ve Implemented
SignalR Integration for:

Broadcasting canvas updates

Real-time chat

Active users and drawer updates

Timer and round management

Scoreboard synchronization

Whiteboard Functionality:

Undo, Clear, Send drawing actions

Game Logic:

Random word generation

Word guessing with points

Rounds and timers

Audio cues for different game events

UI Management:

Modals for word selection and game winner

Automatic scrolling for chat

✅ Good Practices Noted
Audio feedback enhances engagement.

Sorting users and handling token verification on init.

Managing chat scroll and DOM manipulation cleanly using ViewChild.

Point system with time bonus, placement bonus, and drawer bonuses.

Extensive use of service abstraction (serviceSrv) for SignalR + backend communication.

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
