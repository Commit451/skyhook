process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();

chai.use(chaiHttp);

const repoPushJson = {
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

const issueUpdatedJson = {
    "comment": {
        "links": {
            "self": {
                "href": "https://api.bitbucket.org/2.0/repositories/teamname/test-repo/issues/1/comments/40245280"
            },
            "html": {
                "href": "https://bitbucket.org/teamname/test-repo/issues/1#comment-40245280"
            }
        },
        "content": {},
        "created_on": "2017-10-02T17:17:02.648866+00:00",
        "user": {
            "username": "username",
            "type": "user",
            "display_name": "display_name",
            "uuid": "{2e09a882-91ad-47dd-a6a1-9a470b3fe1fc}",
            "links": {
                "self": {
                    "href": "https://api.bitbucket.org/2.0/users/username"
                },
                "html": {
                    "href": "https://bitbucket.org/username/"
                },
                "avatar": {
                    "href": "https://bitbucket.org/account/username/avatar/32/"
                }
            }
        },
        "updated_on": "2017-10-02T17:17:02.746872+00:00",
        "type": "issue_comment",
        "id": 40245280
    },
    "changes": {
        "content": {
            "new": "new desc",
            "old": "desc"
        },
        "title": {
            "new": "G UN PB 2",
            "old": "G UN PB"
        },
        "responsible": {
            "new": {},
            "old": {}
        },
        "priority": {
            "new": "major",
            "old": "trivial"
        },
        "assignee": {
            "new": {
                "username": "new_username",
                "type": "user",
                "display_name": "new_displayname",
                "uuid": "{eda334b5-2806-4d03-9972-e6f09e7eddf3}",
                "links": {
                    "self": {
                        "href": "https://api.bitbucket.org/2.0/users/new_username"
                    },
                    "html": {
                        "href": "https://bitbucket.org/new_username/"
                    },
                    "avatar": {
                        "href": "https://bitbucket.org/account/new_username/avatar/32/"
                    }
                }
            },
            "old": {
                "username": "username",
                "type": "user",
                "display_name": "display_name",
                "uuid": "{2e09a882-91ad-47dd-a6a1-9a470b3fe1fc}",
                "links": {
                    "self": {
                        "href": "https://api.bitbucket.org/2.0/users/username"
                    },
                    "html": {
                        "href": "https://bitbucket.org/username/"
                    },
                    "avatar": {
                        "href": "https://bitbucket.org/account/username/avatar/32/"
                    }
                }
            }
        },
        "attachment": {
            "type": "issue_attachment",
            "name": "test.txt",
            "links": {
                "self": {
                    "href": [
                        "https://api.bitbucket.org/2.0/repositories/teamname/test-repo/issues/1/attachments/test.txt"
                    ]
                }
            }
        }
    },
    "issue": {
        "content": {
            "raw": "new desc",
            "markup": "markdown",
            "html": "<p>new desc</p>"
        },
        "kind": "enhancement",
        "repository": {
            "full_name": "teamname/test-repo",
            "type": "repository",
            "name": "Test Repo",
            "links": {
                "self": {
                    "href": "https://api.bitbucket.org/2.0/repositories/teamname/test-repo"
                },
                "html": {
                    "href": "https://bitbucket.org/teamname/test-repo"
                },
                "avatar": {
                    "href": "https://bitbucket.org/teamname/test-repo/avatar/32/"
                }
            },
            "uuid": "{13c23f1e-0aa5-4fa5-bebf-b883d05d1db8}"
        },
        "links": {
            "attachments": {
                "href": "https://api.bitbucket.org/2.0/repositories/teamname/test-repo/issues/1/attachments"
            },
            "self": {
                "href": "https://api.bitbucket.org/2.0/repositories/teamname/test-repo/issues/1"
            },
            "watch": {
                "href": "https://api.bitbucket.org/2.0/repositories/teamname/test-repo/issues/1/watch"
            },
            "comments": {
                "href": "https://api.bitbucket.org/2.0/repositories/teamname/test-repo/issues/1/comments"
            },
            "html": {
                "href": "https://bitbucket.org/teamname/test-repo/issues/1/g-un-pb-2"
            },
            "vote": {
                "href": "https://api.bitbucket.org/2.0/repositories/teamname/test-repo/issues/1/vote"
            }
        },
        "title": "G UN PB 2",
        "reporter": {
            "username": "username",
            "type": "user",
            "display_name": "display_name",
            "uuid": "{2e09a882-91ad-47dd-a6a1-9a470b3fe1fc}",
            "links": {
                "self": {
                    "href": "https://api.bitbucket.org/2.0/users/username"
                },
                "html": {
                    "href": "https://bitbucket.org/username/"
                },
                "avatar": {
                    "href": "https://bitbucket.org/account/username/avatar/32/"
                }
            }
        },
        "component": null,
        "votes": 0,
        "watches": 1,
        "priority": "major",
        "assignee": {
            "username": "new_username",
            "type": "user",
            "display_name": "new_displayname",
            "uuid": "{eda334b5-2806-4d03-9972-e6f09e7eddf3}",
            "links": {
                "self": {
                    "href": "https://api.bitbucket.org/2.0/users/new_username"
                },
                "html": {
                    "href": "https://bitbucket.org/new_username/"
                },
                "avatar": {
                    "href": "https://bitbucket.org/account/new_username/avatar/32/"
                }
            }
        },
        "state": "closed",
        "version": null,
        "edited_on": null,
        "created_on": "2017-10-02T12:04:31.292559+00:00",
        "milestone": null,
        "updated_on": "2017-10-02T17:17:02.691383+00:00",
        "type": "issue",
        "id": 1
    },
    "actor": {
        "username": "username",
        "type": "user",
        "display_name": "display_name",
        "uuid": "{2e09a882-91ad-47dd-a6a1-9a470b3fe1fc}",
        "links": {
            "self": {
                "href": "https://api.bitbucket.org/2.0/users/username"
            },
            "html": {
                "href": "https://bitbucket.org/username/"
            },
            "avatar": {
                "href": "https://bitbucket.org/account/username/avatar/32/"
            }
        }
    },
    "repository": {
        "scm": "git",
        "website": "",
        "name": "Test Repo",
        "links": {
            "self": {
                "href": "https://api.bitbucket.org/2.0/repositories/teamname/test-repo"
            },
            "html": {
                "href": "https://bitbucket.org/teamname/test-repo"
            },
            "avatar": {
                "href": "https://bitbucket.org/teamname/test-repo/avatar/32/"
            }
        },
        "project": {
            "links": {
                "self": {
                    "href": "https://api.bitbucket.org/2.0/teams/teamname/projects/TP"
                },
                "html": {
                    "href": "https://bitbucket.org/account/user/teamname/projects/TP"
                },
                "avatar": {
                    "href": "https://bitbucket.org/account/user/teamname/projects/TP/avatar/32"
                }
            },
            "type": "project",
            "uuid": "{a901e1bc-e884-457a-a8b1-48007a25b794}",
            "key": "TP",
            "name": "Test Project"
        },
        "full_name": "teamname/test-repo",
        "owner": {
            "username": "teamname",
            "type": "team",
            "display_name": "teamname",
            "uuid": "{65ef831b-23bf-4f10-8d1d-3337def238f0}",
            "links": {
                "self": {
                    "href": "https://api.bitbucket.org/2.0/teams/teamname"
                },
                "html": {
                    "href": "https://bitbucket.org/teamname/"
                },
                "avatar": {
                    "href": "https://bitbucket.org/account/teamname/avatar/32/"
                }
            }
        },
        "type": "repository",
        "is_private": false,
        "uuid": "{13c23f1e-0aa5-4fa5-bebf-b883d05d1db8}"
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
                res.body.should.have.property('embeds');
                done();
            });
    });

    it('issue:updated', (done) => {
        chai.request(server)
            .post('/api/webhooks/test/test/bitbucket')
            .set("X-Event-Key", "issue:updated")
            .set("test", "true")
            .send(issueUpdatedJson)
            .end((err, res) => {
                res.should.have.status(200);
                console.log(res.body);
                res.body.should.be.a('object');
                res.body.should.have.property('embeds');
                done();
            });
    });
});