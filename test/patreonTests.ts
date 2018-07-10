import { Patreon } from '../src/providers/Patreon'
import { Tester } from './Tester'

const json = {
    data:
        {
            attributes:
                {
                    amount_cents: 150,
                    created_at: '2015-05-18T23:50:42+00:00',
                    declined_since: null,
                    patron_pays_fees: false,
                    pledge_cap_cents: null
                },
            id: '1',
            relationships:
                {
                    address: {data: null},
                    creator:
                        {
                            data: {id: '6803547', type: 'user'},
                            links: {related: 'https://www.patreon.com/api/user/6803547'}
                        },
                    patron:
                        {
                            data: {id: '32187', type: 'user'},
                            links: {related: 'https://www.patreon.com/api/user/32187'}
                        },
                    reward:
                        {
                            data: {id: '1824235', type: 'reward'},
                            links: {related: 'https://www.patreon.com/api/rewards/1824235'}
                        }
                },
            type: 'pledge'
        },
    included:
        [{
            attributes:
                {
                    about: 'Hey there',
                    created: '2013-05-10T13:27:42+00:00',
                    facebook: 'https://www.facebook.com/foo',
                    first_name: 'Corgi',
                    full_name: 'Corgi Pager & Friends',
                    gender: 0,
                    image_url: 'https://c3.patreon.com/2/patreon-user/QIsuvl8VXy6o0SG6Ha2LhXvFFk6vbUUvlOyVBRL28FAQLzLOTFQIyOnkk9QTqVFo_large_2.jpeg?t=2145916800&w=400&v=-DVETVui016IwP7E5H_2gG9USey5EZOh_YlznXftZUU%3D',
                    last_name: 'Pager & Friends',
                    thumb_url: 'https://c3.patreon.com/2/patreon-user/QIsuvl8VXy6o0SG6Ha2LhXvFFk6vbUUvlOyVBRL28FAQLzLOTFQIyOnkk9QTqVFo_large_2.jpeg?h=100&t=2145916800&w=100&v=shrbfLKwzGIBgbuYhcRtNRWxetDsE3Hu88YafYxTOuY%3D',
                    twitch: 'https://www.twitch.tv/foo',
                    twitter: '',
                    url: 'https://www.patreon.com/corgi',
                    vanity: 'corgi',
                    youtube: ''
                },
            id: '32187',
            relationships:
                {
                    campaign:
                        {
                            data: {id: '70261', type: 'campaign'},
                            links: {related: 'https://www.patreon.com/api/campaigns/70261'}
                        }
                },
            type: 'user'
        },
            {
                attributes:
                    {
                        amount: 100,
                        amount_cents: 100,
                        created_at: '2017-07-07T07:59:13.450021+00:00',
                        deleted_at: null,
                        description: '<ul><li>Earn the <strong>Patron</strong> rank on our <a href="https://discordapp.com/invite/MkmRnhd" rel="nofollow noopener" target="_blank">Discord Server</a>.</li></ul>',
                        discord_role_ids: ['332788975498428416'],
                        edited_at: '2017-07-14T04:28:25.358651+00:00',
                        image_url: null,
                        patron_count: 0,
                        post_count: null,
                        published: true,
                        published_at: '2017-07-07T07:59:13.450021+00:00',
                        remaining: null,
                        requires_shipping: false,
                        title: 'Patron on Discord',
                        unpublished_at: null,
                        url: '/bePatron?c=1052935&rid=1824235',
                        user_limit: null
                    },
                id: '1824235',
                relationships:
                    {
                        campaign:
                            {
                                data: {id: '1052935', type: 'campaign'},
                                links: {related: 'https://www.patreon.com/api/campaigns/1052935'}
                            },
                        creator:
                            {
                                data: {id: '6803547', type: 'user'},
                                links: {related: 'https://www.patreon.com/api/user/6803547'}
                            }
                    },
                type: 'reward'
            },
            {
                attributes:
                    {
                        about: null,
                        created: '2017-07-07T07:22:48+00:00',
                        discord_id: null,
                        email: 'test@test.com',
                        facebook: null,
                        facebook_id: null,
                        first_name: 'Aventium',
                        full_name: 'Aventium Softworks',
                        gender: 0,
                        has_password: true,
                        image_url: 'https://c3.patreon.com/2/patreon-user/hh-pcVChqhD0NqBfag9UCRndTOgtu_KZ3rIlWLJDZcDA5EopsRfKh3VPJkEtw20W.png?t=2145916800&w=400&v=vELAoLALnjE3uuQCu51JeeYekzquf0ZG6s6DI0f1Ze8%3D',
                        is_deleted: false,
                        is_email_verified: true,
                        is_nuked: false,
                        is_suspended: false,
                        last_name: 'Softworks',
                        social_connections:
                            {
                                deviantart: null,
                                discord: null,
                                facebook: null,
                                spotify: null,
                                twitch: null,
                                twitter: null,
                                youtube: null
                            },
                        thumb_url: 'https://c3.patreon.com/2/patreon-user/hh-pcVChqhD0NqBfag9UCRndTOgtu_KZ3rIlWLJDZcDA5EopsRfKh3VPJkEtw20W.png?h=100&t=2145916800&w=100&v=06A95RUDK68K63cKM1qt0yF-1QlxmEPkfa0yNEkGH8w%3D',
                        twitch: null,
                        twitter: null,
                        url: 'https://www.patreon.com/aventsoft',
                        vanity: 'aventsoft',
                        youtube: null
                    },
                id: '6803547',
                relationships:
                    {
                        campaign:
                            {
                                data: {id: '1052935', type: 'campaign'},
                                links: {related: 'https://www.patreon.com/api/campaigns/1052935'}
                            }
                    },
                type: 'user'
            },
            {
                attributes:
                    {
                        created_at: '2013-05-10T13:27:42+00:00',
                        creation_count: 272,
                        creation_name: 'an unforgettable high school experience',
                        display_patron_goals: false,
                        earnings_visibility: 'private',
                        image_small_url: 'https://c3.patreon.com/2/patreon-user/emRRwJHsX35cz1UwteV54ujLO8uwAODyupEXjGmTxGzL6lqwKy7U7l7gRyPma1YX_large_2.png?h=1280&t=2145916800&w=1280&v=NGpqn95fFP0x6GFg58SxhM0bc2B4sCZ-e8HpFxDlaBk%3D',
                        image_url: 'https://c3.patreon.com/2/patreon-user/emRRwJHsX35cz1UwteV54ujLO8uwAODyupEXjGmTxGzL6lqwKy7U7l7gRyPma1YX_large_2.png?t=2145916800&w=1920&v=9Ga_Pd9-tXNWlxMiR5Ey1voSx-U58nxEoqivHptGbNQ%3D',
                        is_charged_immediately: false,
                        is_monthly: false,
                        is_nsfw: false,
                        is_plural: false,
                        main_video_embed: '',
                        main_video_url: '',
                        one_liner: 'We\'re just some people trying to help artists make money and migrate from PHP to PYTHON while supporting an existing user base and their daily transactions',
                        outstanding_payment_amount_cents: 0,
                        patron_count: 18,
                        pay_per_name: 'creation',
                        pledge_url: '/bePatron?c=70261',
                        published_at: '2016-09-10T22:25:16+00:00',
                        summary: '<img src="http://s33.postimg.org/86d2ab33j/about_banner.png"><br><h3>In my <em>small </em>country school I was very popular and the top student. Easily the most beautiful corgi in my grade, possibly my entire school. Most certainly in my class. </h3><br>Since moving to a city I have encountered many challenges. The students at my school are much smarter, much faster, and can jump much much higher over the vault box. Indeed, it is my greatest shame. <span style="color: rgb(192, 80, 77);"></span><span style="background-color: rgb(242, 220, 219);"><span style="color: rgb(192, 80, 77);">The vault box</span></span>.<br><br><img src="http://s33.postimg.org/4ekvvc5f3/vault_box_injustice.png"><br><em>As you can see from this graphic, the vault box is an unjust physical education examination for a corgi. </em><strong><em>However</em></strong><em>, it is not in my nature to simply give up. I dream of setting the school record for highest vault jump and I will work very hard to achieve this dream.<br><br></em>With your help I hope to overcome my obstacles and achieve my dreams.<br><br><ol><li>Become the model student of my new school</li><li>Achieve the highest jump over the vault box.</li><li>Senpai notices me</li></ol>\n<br>In exchange you will receive many benefits:<br><ul><li>Digest of corgi news curated from <a href="https://vine.co/tags/corgi" rel="nofollow">vine and other sources</a>.</li><li>A corgi\'s perspective of world events on my <a href="http://twitter.com/a-corgi-dreams" rel="nofollow">twitter</a>.</li><li>...and much much more.</li></ul><br>\n<img src="http://media-cache-ec0.pinimg.com/736x/4d/35/bf/4d35bf1aa2a2240b06485809083f44de.jpg"><br><br>no nofollow <a href="https://www.patreon.com/peterhollens">https://www.patreon.com/peterhollens</a><br>yes nofollow <a href="https://www.youtube.com/user/peterhollens" rel="nofollow">https://www.youtube.com/user/peterhollens</a>'
                    },
                id: '70261',
                relationships:
                    {
                        creator:
                            {
                                data: {id: '32187', type: 'user'},
                                links: {related: 'https://www.patreon.com/api/user/32187'}
                            },
                        goals:
                            {
                                data:
                                    [{id: '443028', type: 'goal'},
                                        {id: '443029', type: 'goal'},
                                        {id: '443100', type: 'goal'}]
                            },
                        rewards:
                            {
                                data:
                                    [{id: '-1', type: 'reward'},
                                        {id: '0', type: 'reward'},
                                        {id: '1408001', type: 'reward'},
                                        {id: '563244', type: 'reward'},
                                        {id: '1385705', type: 'reward'},
                                        {id: '1062816', type: 'reward'},
                                        {id: '1385731', type: 'reward'}]
                            }
                    },
                type: 'campaign'
            },
            {
                attributes:
                    {
                        created_at: '2017-07-07T07:24:59+00:00',
                        creation_count: 0,
                        creation_name: 'software',
                        discord_server_id: '211524927831015424',
                        display_patron_goals: false,
                        earnings_visibility: null,
                        image_small_url: 'https://c3.patreon.com/2/patreon-user/67sBqYJMCY-OJxkGLrWqHtFLoqc8l4kYyyT91DueGDEFLYbACrqGCHi3sNIHm1Ry.jpg?h=1280&t=2145916800&w=1280&v=kT5bCHoYM06Tyv9KhW0No0qcGtNJ0EkJ2MSjKF3BWAc%3D',
                        image_url: 'https://c3.patreon.com/2/patreon-user/67sBqYJMCY-OJxkGLrWqHtFLoqc8l4kYyyT91DueGDEFLYbACrqGCHi3sNIHm1Ry.jpg?t=2145916800&w=1920&v=1M7g06lBoLyqYLvmysDr2iZoYrRf7FpRxRxSEMOY7Ts%3D',
                        is_charged_immediately: false,
                        is_monthly: true,
                        is_nsfw: false,
                        is_plural: false,
                        main_video_embed: null,
                        main_video_url: null,
                        one_liner: null,
                        outstanding_payment_amount_cents: 0,
                        patron_count: 0,
                        pay_per_name: 'month',
                        pledge_sum: 0,
                        pledge_url: '/bePatron?c=1052935',
                        published_at: '2017-07-07T07:29:12+00:00',
                        summary: null,
                        thanks_embed: null,
                        thanks_msg: null,
                        thanks_video_url: null
                    },
                id: '1052935',
                relationships:
                    {
                        creator:
                            {
                                data: {id: '6803547', type: 'user'},
                                links: {related: 'https://www.patreon.com/api/user/6803547'}
                            },
                        goals: {data: []},
                        rewards:
                            {
                                data:
                                    [{id: '-1', type: 'reward'},
                                        {id: '0', type: 'reward'},
                                        {id: '1824235', type: 'reward'}]
                            }
                    },
                type: 'campaign'
            },
            {
                attributes:
                    {
                        amount: 0,
                        amount_cents: 0,
                        created_at: null,
                        description: 'Everyone',
                        remaining: 0,
                        requires_shipping: false,
                        type: 'reward',
                        url: null,
                        user_limit: null
                    },
                id: '-1',
                relationships:
                    {
                        creator:
                            {
                                data: {id: '32187', type: 'user'},
                                links: {related: 'https://www.patreon.com/api/user/32187'}
                            }
                    },
                type: 'reward'
            },
            {
                attributes:
                    {
                        amount: 1,
                        amount_cents: 1,
                        created_at: null,
                        description: 'Patrons Only',
                        remaining: 0,
                        requires_shipping: false,
                        type: 'reward',
                        url: null,
                        user_limit: null
                    },
                id: '0',
                relationships:
                    {
                        creator:
                            {
                                data: {id: '32187', type: 'user'},
                                links: {related: 'https://www.patreon.com/api/user/32187'}
                            }
                    },
                type: 'reward'
            },
            {
                attributes:
                    {
                        amount: 100,
                        amount_cents: 100,
                        created_at: '2017-02-15T19:54:50.018468+00:00',
                        deleted_at: null,
                        description: 'Get a patron-only perspective.',
                        discord_role_ids: null,
                        edited_at: '2017-07-10T18:21:45.322160+00:00',
                        image_url: 'https://s3-us-west-1.amazonaws.com/patreon-reward-images/1408001.png',
                        post_count: 19,
                        published: true,
                        published_at: '2017-03-31T21:20:19.342290+00:00',
                        remaining: null,
                        requires_shipping: true,
                        title: 'Behind The Scenes',
                        unpublished_at: null,
                        url: '/bePatron?c=70261&rid=1408001'
                    },
                id: '1408001',
                relationships:
                    {
                        campaign:
                            {
                                data: {id: '70261', type: 'campaign'},
                                links: {related: 'https://www.patreon.com/api/campaigns/70261'}
                            },
                        creator:
                            {
                                data: {id: '32187', type: 'user'},
                                links: {related: 'https://www.patreon.com/api/user/32187'}
                            }
                    },
                type: 'reward'
            },
            {
                attributes:
                    {
                        amount: 100,
                        amount_cents: 100,
                        created_at: '2016-11-21T22:31:11+00:00',
                        deleted_at: null,
                        description: '<img src="http://s33.postimg.org/mag6tm4bz/level_1.png">I am so honored that you should choose to support a simple corgi in pursuit of a simple dream. Thanks so much for starting on this journey with me....<br>\n<br>\n',
                        discord_role_ids: null,
                        edited_at: '2016-12-16T01:51:55.780220+00:00',
                        image_url: null,
                        post_count: 19,
                        published: true,
                        published_at: '2016-12-05T20:30:07+00:00',
                        remaining: null,
                        requires_shipping: false,
                        title: 'Some patrons here',
                        unpublished_at: null,
                        url: '/bePatron?c=70261&rid=563244'
                    },
                id: '563244',
                relationships:
                    {
                        campaign:
                            {
                                data: {id: '70261', type: 'campaign'},
                                links: {related: 'https://www.patreon.com/api/campaigns/70261'}
                            },
                        creator:
                            {
                                data: {id: '32187', type: 'user'},
                                links: {related: 'https://www.patreon.com/api/user/32187'}
                            }
                    },
                type: 'reward'
            },
            {
                attributes:
                    {
                        amount: 100,
                        amount_cents: 100,
                        created_at: '2017-02-08T18:06:45.708277+00:00',
                        deleted_at: null,
                        description: 'Google handgout and lets chat about our next episode',
                        discord_role_ids: null,
                        edited_at: '2017-02-15T18:44:00.986474+00:00',
                        image_url: null,
                        post_count: 19,
                        published: true,
                        published_at: '2017-02-08T18:06:45.708277+00:00',
                        remaining: 14,
                        requires_shipping: true,
                        title: 'Help me write my next podcast',
                        unpublished_at: null,
                        url: '/bePatron?c=70261&rid=1385705'
                    },
                id: '1385705',
                relationships:
                    {
                        campaign:
                            {
                                data: {id: '70261', type: 'campaign'},
                                links: {related: 'https://www.patreon.com/api/campaigns/70261'}
                            },
                        creator:
                            {
                                data: {id: '32187', type: 'user'},
                                links: {related: 'https://www.patreon.com/api/user/32187'}
                            }
                    },
                type: 'reward'
            },
            {
                attributes:
                    {
                        amount: 1000,
                        amount_cents: 1000,
                        created_at: '2016-11-21T22:31:11+00:00',
                        deleted_at: null,
                        description: '<ul>\n<li>Personalized song/video message</li>\n<li>Plus all previous rewards </li>\n</ul>',
                        discord_role_ids: null,
                        edited_at: '2016-12-21T01:00:17.568499+00:00',
                        image_url: null,
                        post_count: null,
                        published: true,
                        published_at: '2016-12-06T23:45:22.215498+00:00',
                        remaining: 1,
                        requires_shipping: true,
                        title: 'NEW',
                        unpublished_at: null,
                        url: '/bePatron?c=70261&rid=1062816'
                    },
                id: '1062816',
                relationships:
                    {
                        campaign:
                            {
                                data: {id: '70261', type: 'campaign'},
                                links: {related: 'https://www.patreon.com/api/campaigns/70261'}
                            },
                        creator:
                            {
                                data: {id: '32187', type: 'user'},
                                links: {related: 'https://www.patreon.com/api/user/32187'}
                            }
                    },
                type: 'reward'
            },
            {
                attributes:
                    {
                        amount: 2000,
                        amount_cents: 2000,
                        created_at: '2017-02-08T18:08:46.129090+00:00',
                        deleted_at: null,
                        description: 'Learn more about how I play.<ul><li>See my strategies</li><li>Tutorials</li><li>Plus all previous rewards</li></ul>',
                        discord_role_ids: null,
                        edited_at: '2017-06-09T18:56:19.725597+00:00',
                        image_url: 'https://s3-us-west-1.amazonaws.com/patreon-reward-images/recommendations/G_Strategy_videos.png',
                        post_count: 6,
                        published: true,
                        published_at: '2017-06-09T18:56:19.719411+00:00',
                        remaining: null,
                        requires_shipping: false,
                        title: 'vidjastrats',
                        unpublished_at: null,
                        url: '/bePatron?c=70261&rid=1385731'
                    },
                id: '1385731',
                relationships:
                    {
                        campaign:
                            {
                                data: {id: '70261', type: 'campaign'},
                                links: {related: 'https://www.patreon.com/api/campaigns/70261'}
                            },
                        creator:
                            {
                                data: {id: '32187', type: 'user'},
                                links: {related: 'https://www.patreon.com/api/user/32187'}
                            }
                    },
                type: 'reward'
            },
            {
                attributes:
                    {
                        completed_percentage: 2,
                        created_at: '2016-06-01T20:14:10+00:00',
                        description: 'Get senpai to notice me...',
                        reached_at: null,
                        title: ''
                    },
                id: '443028',
                type: 'goal'
            },
            {
                attributes:
                    {
                        completed_percentage: 1,
                        created_at: '2016-06-01T20:15:20+00:00',
                        description: '<strong><em>Two</em></strong> senpais.',
                        reached_at: null,
                        title: ''
                    },
                id: '443029',
                type: 'goal'
            },
            {
                attributes:
                    {
                        completed_percentage: 1,
                        created_at: '2016-06-01T21:20:27+00:00',
                        description: 'I will be able to hire a coach to help my overcome the highly unjust vault box. This coach will have a special focus on helping vertically challenged dogs jump very <em>remarkable</em> heights. Sometimes <strong>olympic</strong> heights.',
                        reached_at: null,
                        title: ''
                    },
                id: '443100',
                type: 'goal'
            }],
    links: {self: 'https://www.patreon.com/api/pledges/1'}
}

describe('/POST patreon', () => {
    it('pledges:update', async () => {
        const headers = {
            'x-patreon-event': 'pledges:update'
        }
        Tester.test(new Patreon(), json, headers)
    })
})
