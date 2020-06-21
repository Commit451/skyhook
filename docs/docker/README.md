## Running with Docker
We have a Docker image provided [here](https://hub.docker.com/repository/docker/commit451/skyhook).

To pull the image:
```
docker pull commit451/skyhook
```
To run the application:
```
docker run -it --rm -p 80:8080 commit451/skyhook
```
Then, you can navigate to the IP of the docker in your browser and can see it is running!