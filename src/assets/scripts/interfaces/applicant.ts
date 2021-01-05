import Author from '../models/author';

export default interface ApplicantInterface {
  id: string;
  author: Author;
  message: string;
  oppId: string;
}
