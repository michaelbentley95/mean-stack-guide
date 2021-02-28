import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Post } from '../post.model'
import { PostsService } from '../posts.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {

  // posts = [
  //   {title: 'First Post', content: 'This is the first post content'},
  //   {title: 'Second Post', content: 'This is the second post content'},
  //   {title: 'Third Post', content: 'This is the third post content'},
  // ];

  posts: Post[] = [];
  isLoading = false;
  private postsSubscription: Subscription;

  constructor(public postsService: PostsService) {

  }

  ngOnInit() {
    this.postsService.getPosts();
    this.isLoading = true;
    this.postsSubscription = this.postsService.getPostUpdateListener().subscribe({
      next: (posts: Post[]) => {
        this.isLoading = false;
        this.posts = posts;
      }
    });
  }

  onDelete(postId: string){
    this.postsService.deletePost(postId);
  }

  ngOnDestroy(){
    this.postsSubscription.unsubscribe();
  }

}
