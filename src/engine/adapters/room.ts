import User from './user';

export default class Room {
  roomId: number = null;
  members: Array<User> = [];
  started: boolean = false;

  constructor(roomId) {
    this.roomId = roomId;
  }

  addMember(newUser: User) {
    const memberIndex = this.members.findIndex(user => user.id === newUser.id);
    const isAlreadyAdded = memberIndex > -1;
    // should have thrown error ?
    if (isAlreadyAdded) {
      this.members[memberIndex].sendError('You Already joined the room');
      return;
    }
    this.members.push(newUser);
  }

  start() {
    this.started = true;
    console.log('members', this.members);
    this.members.forEach(user => {
      user.sendMessage({
        type: 'started',
        message: 'room will be started',
      });
    });
  }
}
