import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Post } from './post.model';
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(){
    this.http
    .get<{message: string, data: any}>('http://localhost:3000/api/posts')
    //All of this just to convert _id to id
    .pipe(map((postData) => {
      return postData.data.map(post => {
        return {
          title: post.title,
          content: post.content,
          id: post._id,
          imagePath: post.imagePath
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

  getPost(id: string) {
    return this.http.get<{message: string, data: {_id: string, title: string, content: string, imagePath: string}}>('http://localhost:3000/api/posts/' + id);
  }

  addPost(title: string, content: string, image: File){
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title);
    this.http.post<{message: string, data: Post}>('http://localhost:3000/api/posts', postData).subscribe((res)=>{
      const post: Post = {id: res.data.id, title: title, content: content, imagePath: res.data.imagePath};
      this.posts.push(post);
      this.postsUpdated.next([...this.posts]);
      this.router.navigate(["/"]);
    });
  }

  updatePost(id: string, title: string, content: string, image: File | string){
    let postData: Post | FormData;
    if(typeof(image) === 'object'){ //If the image passed in was uploaded
      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);
    }
    else{
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
      };
    }
    this.http.put('http://localhost:3000/api/posts/' + id, postData).subscribe(res=>{
      //Update the posts variable to reflect the changes we made. Find the updated post and replace it
      const updatedPosts = [...this.posts];
      const oldPostIndex = updatedPosts.findIndex(p => p.id === id);
      const post: Post = {id: id, title: title, content: content, imagePath: ""};
      updatedPosts[oldPostIndex] = post;
      this.posts = updatedPosts;
      this.postsUpdated.next();
      this.router.navigate(["/"]);
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
