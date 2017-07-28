import facebook
import os
from os.path import join, dirname
from dotenv import load_dotenv

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)


class Grabber(object):

    def __init__(self, page_id):
        self.page_id = page_id
        self.access_token = os.environ.get('access_token')
        self.graph = facebook.GraphAPI(access_token=self.access_token)
        self.page_fans_country_query = '/%s/insights/page_fans_country/lifetime/' % self.page_id

    def get_last_10_posts(self):
        fields = {'fields': 'feed.limit(10){likes.summary(true).limit(0),created_time,comments.limit(0).summary(true),shares}'}
        feed = self.graph.get_object('/%s' % self.page_id, **fields)

        posts = []
        for post in feed['feed']['data']:
            posts.append({
                'likes': post['likes']['summary']['total_count'],
                'post_id': post['id'],
                'time': post['created_time'],
                'shares': self.get_post_shares(post),
                'comments': post['comments']['summary']['total_count']
            })
        return posts

    def get_page_fans_by_country(self):
        data = self.graph.get_object(self.page_fans_country_query)
        if data['data']:
            return data['data'][0]['values'][0]

    def get_post_shares(self, post):
        if 'shares' in post:
            return post['shares']['count']
        return 0

    def get_links(self):
        # added link field
        fields = {'fields': 'feed.limit(100){id,message,type}'}
        feed = self.graph.get_object('/%s' % self.page_id, **fields)
        posts_links = []
        for post in feed['feed']['data']:
            # if post is contaned 'link' then to form data like  {'id': id, 'message': message}
            if post['type'] == 'link':
                posts_links.append({
                    'id': post['id'],
                    'message': post['message']
                })
        return posts_links

    def get_videos(self):
        fields = {'fields': 'videos{id,length,created_time,source}'}
        videos = self.graph.get_object('/%s' % self.page_id, **fields)
        return videos


if __name__ == '__main__':
    natgeo_page_id = '23497828950'
    grabber = Grabber(natgeo_page_id)

