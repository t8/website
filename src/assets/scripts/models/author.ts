import jdenticon from 'jdenticon';
import AuthorInterface from "../interfaces/author";
import communityDB from "../libs/db";

export default class Author {
  private _name: string;
  private _address: string;
  private _avatar: string;

  get address(): string {
    return this._address;
  }

  constructor(name: string, address: string, avatar: string) {
    this._name = name;
    this._address = address;
    this._avatar = avatar;
  }

  async getDetails(): Promise<AuthorInterface> {
    // caching but for only 30 mins
    if(!this._avatar) {
      const res = communityDB.get(this._address);
      let author: any;

      if(res) {
        author = res;
      } else {
        author = {name: this.address, address: this.address};
        try {
          // @ts-ignore
          communityDB.set(this._address, author, (new Date().getTime() + 30 * 60 * 1000));
        } catch(e) {}
      }
      
      this._name = author.name || this._address;
      
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      jdenticon.drawIcon(canvas.getContext('2d'), this._name, 32);
      this._avatar = canvas.toDataURL();
    }

    return {
      name: this._name,
      address: this._address,
      avatar: this._avatar
    };
  }
}