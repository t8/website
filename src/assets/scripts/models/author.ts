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
      const $svg = $(jdenticon.toSvg(name, 32));
      const s = new XMLSerializer().serializeToString($svg[0]);
      this._avatar = `data:image/svg+xml;base64,${window.btoa(s)}`;
    }

    return {
      name: this._name,
      address: this._address,
      avatar: this._avatar
    };
  }
}