process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();

chai.use(chaiHttp);

var repoPushJson = {
    "push": {
        "changes": [
            {
                "forced": false,
                "old": {
                    "type": "branch",
                    "name": "master",
                    "links": {
                        "commits": {
                            "href": "https://api.bitbucket.org/2.0/repositories/Mythen/bot/commits/master"
                        },
                        "self": {
                            "href": "https://api.bitbucket.org/2.0/repositories/Mythen/bot/refs/branches/master"
                        },
                        "html": {
                            "href": "https://bitbucket.org/Mythen/bot/branch/master"
                        }
                    },
                    "target": {
                        "hash": "fc246a4b6e69531398a937fa614c8584f2b473fd",
                        "links": {
                            "self": {
                                "href": "https://api.bitbucket.org/2.0/repositories/Mythen/bot/commit/fc246a4b6e69531398a937fa614c8584f2b473fd"
                            },
                            "html": {
                                "href": "https://bitbucket.org/Mythen/bot/commits/fc246a4b6e69531398a937fa614c8584f2b473fd"
                            }
                        },
                        "author": {
                            "raw": "Mythen <*private mail*>",
                            "user": {
                                "username": "Mythen",
                                "type": "user",
                                "display_name": "Mythen",
                                "uuid": "{d22d7853-231c-4d6d-870b-bde0e628130c}",
                                "links": {
                                    "self": {
                                        "href": "https://api.bitbucket.org/2.0/users/Mythen"
                                    },
                                    "html": {
                                        "href": "https://bitbucket.org/Mythen/"
                                    },
                                    "avatar": {
                                        "href": "https://bitbucket.org/account/Mythen/avatar/32/"
                                    }
                                }
                            }
                        },
                        "parents": [
                            {
                                "type": "commit",
                                "hash": "297993c88378c757b6b402ecccba8ddc5a91a2a9",
                                "links": {
                                    "self": {
                                        "href": "https://api.bitbucket.org/2.0/repositories/Mythen/bot/commit/297993c88378c757b6b402ecccba8ddc5a91a2a9"
                                    },
                                    "html": {
                                        "href": "https://bitbucket.org/Mythen/bot/commits/297993c88378c757b6b402ecccba8ddc5a91a2a9"
                                    }
                                }
                            }
                        ],
                        "date": "2017-04-16T15:28:11+00:00",
                        "message": "test created online with Bitbucket",
                        "type": "commit"
                    }
                },
                "links": {
                    "diff": {
                        "href": "https://api.bitbucket.org/2.0/repositories/Mythen/bot/diff/abed126eae48e8c957ed222b3b5fbabdcfd7b77c..fc246a4b6e69531398a937fa614c8584f2b473fd"
                    },
                    "html": {
                        "href": "https://bitbucket.org/Mythen/bot/branches/compare/abed126eae48e8c957ed222b3b5fbabdcfd7b77c..fc246a4b6e69531398a937fa614c8584f2b473fd"
                    },
                    "commits": {
                        "href": "https://api.bitbucket.org/2.0/repositories/Mythen/bot/commits?include=abed126eae48e8c957ed222b3b5fbabdcfd7b77c&exclude=fc246a4b6e69531398a937fa614c8584f2b473fd"
                    }
                },
                "created": false,
                "commits": [
                    {
                        "hash": "abed126eae48e8c957ed222b3b5fbabdcfd7b77c",
                        "links": {
                            "self": {
                                "href": "https://api.bitbucket.org/2.0/repositories/Mythen/bot/commit/abed126eae48e8c957ed222b3b5fbabdcfd7b77c"
                            },
                            "comments": {
                                "href": "https://api.bitbucket.org/2.0/repositories/Mythen/bot/commit/abed126eae48e8c957ed222b3b5fbabdcfd7b77c/comments"
                            },
                            "patch": {
                                "href": "https://api.bitbucket.org/2.0/repositories/Mythen/bot/patch/abed126eae48e8c957ed222b3b5fbabdcfd7b77c"
                            },
                            "html": {
                                "href": "https://bitbucket.org/Mythen/bot/commits/abed126eae48e8c957ed222b3b5fbabdcfd7b77c"
                            },
                            "diff": {
                                "href": "https://api.bitbucket.org/2.0/repositories/Mythen/bot/diff/abed126eae48e8c957ed222b3b5fbabdcfd7b77c"
                            },
                            "approve": {
                                "href": "https://api.bitbucket.org/2.0/repositories/Mythen/bot/commit/abed126eae48e8c957ed222b3b5fbabdcfd7b77c/approve"
                            },
                            "statuses": {
                                "href": "https://api.bitbucket.org/2.0/repositories/Mythen/bot/commit/abed126eae48e8c957ed222b3b5fbabdcfd7b77c/statuses"
                            }
                        },
                        "author": {
                            "raw": "Mythen <*private mail*>",
                            "user": {
                                "username": "Mythen",
                                "type": "user",
                                "display_name": "Mythen",
                                "uuid": "{d22d7853-231c-4d6d-870b-bde0e628130c}",
                                "links": {
                                    "self": {
                                        "href": "https://api.bitbucket.org/2.0/users/Mythen"
                                    },
                                    "html": {
                                        "href": "https://bitbucket.org/Mythen/"
                                    },
                                    "avatar": {
                                        "href": "https://bitbucket.org/account/Mythen/avatar/32/"
                                    }
                                }
                            }
                        },
                        "parents": [
                            {
                                "type": "commit",
                                "hash": "fc246a4b6e69531398a937fa614c8584f2b473fd",
                                "links": {
                                    "self": {
                                        "href": "https://api.bitbucket.org/2.0/repositories/Mythen/bot/commit/fc246a4b6e69531398a937fa614c8584f2b473fd"
                                    },
                                    "html": {
                                        "href": "https://bitbucket.org/Mythen/bot/commits/fc246a4b6e69531398a937fa614c8584f2b473fd"
                                    }
                                }
                            }
                        ],
                        "date": "2017-04-17T10:11:08+00:00",
                        "message": "Added file test2",
                        "type": "commit"
                    }
                ],
                "truncated": false,
                "closed": false,
                "new": {
                    "type": "branch",
                    "name": "master",
                    "links": {
                        "commits": {
                            "href": "https://api.bitbucket.org/2.0/repositories/Mythen/bot/commits/master"
                        },
                        "self": {
                            "href": "https://api.bitbucket.org/2.0/repositories/Mythen/bot/refs/branches/master"
                        },
                        "html": {
                            "href": "https://bitbucket.org/Mythen/bot/branch/master"
                        }
                    },
                    "target": {
                        "hash": "abed126eae48e8c957ed222b3b5fbabdcfd7b77c",
                        "links": {
                            "self": {
                                "href": "https://api.bitbucket.org/2.0/repositories/Mythen/bot/commit/abed126eae48e8c957ed222b3b5fbabdcfd7b77c"
                            },
                            "html": {
                                "href": "https://bitbucket.org/Mythen/bot/commits/abed126eae48e8c957ed222b3b5fbabdcfd7b77c"
                            }
                        },
                        "author": {
                            "raw": "Mythen <*private mail*>",
                            "user": {
                                "username": "Mythen",
                                "type": "user",
                                "display_name": "Mythen",
                                "uuid": "{d22d7853-231c-4d6d-870b-bde0e628130c}",
                                "links": {
                                    "self": {
                                        "href": "https://api.bitbucket.org/2.0/users/Mythen"
                                    },
                                    "html": {
                                        "href": "https://bitbucket.org/Mythen/"
                                    },
                                    "avatar": {
                                        "href": "https://bitbucket.org/account/Mythen/avatar/32/"
                                    }
                                }
                            }
                        },
                        "parents": [
                            {
                                "type": "commit",
                                "hash": "fc246a4b6e69531398a937fa614c8584f2b473fd",
                                "links": {
                                    "self": {
                                        "href": "https://api.bitbucket.org/2.0/repositories/Mythen/bot/commit/fc246a4b6e69531398a937fa614c8584f2b473fd"
                                    },
                                    "html": {
                                        "href": "https://bitbucket.org/Mythen/bot/commits/fc246a4b6e69531398a937fa614c8584f2b473fd"
                                    }
                                }
                            }
                        ],
                        "date": "2017-04-17T10:11:08+00:00",
                        "message": "Added file test2",
                        "type": "commit"
                    }
                }
            }
        ]
    },
    "repository": {
        "scm": "git",
        "website": null,
        "name": "Bot",
        "links": {
            "self": {
                "href": "https://api.bitbucket.org/2.0/repositories/Mythen/bot"
            },
            "html": {
                "href": "https://bitbucket.org/Mythen/bot"
            },
            "avatar": {
                "href": "https://bitbucket.org/Mythen/bot/avatar/32/"
            }
        },
        "full_name": "Mythen/bot",
        "owner": {
            "username": "Mythen",
            "type": "user",
            "display_name": "Mythen",
            "uuid": "{d22d7853-231c-4d6d-870b-bde0e628130c}",
            "links": {
                "self": {
                    "href": "https://api.bitbucket.org/2.0/users/Mythen"
                },
                "html": {
                    "href": "https://bitbucket.org/Mythen/"
                },
                "avatar": {
                    "href": "https://bitbucket.org/account/Mythen/avatar/32/"
                }
            }
        },
        "type": "repository",
        "is_private": true,
        "uuid": "{f157adae-1509-48e9-a227-d49ab2d0a53a}"
    },
    "actor": {
        "username": "Mythen",
        "type": "user",
        "display_name": "Mythen",
        "uuid": "{d22d7853-231c-4d6d-870b-bde0e628130c}",
        "links": {
            "self": {
                "href": "https://api.bitbucket.org/2.0/users/Mythen"
            },
            "html": {
                "href": "https://bitbucket.org/Mythen/"
            },
            "avatar": {
                "href": "https://bitbucket.org/account/Mythen/avatar/32/"
            }
        }
    }
};

/*
* Test the /POST route
*/
describe('/POST bitbucket', () => {
	it('repo:push', (done) => {
		chai.request(server)
			.post('/api/webhooks/test/test/bitbucket')
			.set("X-Event-Key", "repo:push")
            .set("test", "true")
			.send(repoPushJson)
			.end((err, res) => {
				res.should.have.status(200);
				console.log(res.body);
				res.body.should.be.a('object');
				res.body.should.have.property('embeds')
				done();
			});
	});
});
