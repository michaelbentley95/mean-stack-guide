import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Post } from './post.model';
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient) {}

  getPosts(){
    this.http
    .get<{message: string, data: any}>('http://localhost:3000/api/posts')
    //All of this just to convert _id to id
    .pipe(map((postData) => {
      return postData.data.map(post => {
        return {
          title: post.title,
          content: post.content,
          id: post._id
        }
      })
    }))
    .subscribe(mappedPosts=>{
      this.posts = mappedPosts;
      this.postsUpdated.next([...this.posts]); //Emit a copy of the posts list
    });
  }

  getPostUpdateListener(){
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string){
    const post: Post = {id: null, title: title, content: content};
    this.http.post<{message: string, data: string}>('http://localhost:3000/api/posts', post).subscribe((res)=>{
      post.id = res.data;
      this.posts.push(post);
      this.postsUpdated.next([...this.posts]);
    });
  }

  deletePost(postId: string){
    this.http.delete('http://localhost:3000/api/posts/' + postId).subscribe(()=>{
      const updatedPosts = this.posts.filter(post => post.id != postId);
      this.posts = updatedPosts;
      this.postsUpdated.next([...this.posts]);
    });
  }
}
