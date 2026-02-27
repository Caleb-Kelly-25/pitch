

/* function getGameCode() generates a random place holder game code. Later this fucnction will be updated to actually call the backend for a functioning game code.*/
function getGameCode(){
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function Host() {

    return (
        <div>
            <h1>Host Game</h1>
            <p>{"Create form to host game, including options for public vs private)"}</p>
            <p>Game Code: {getGameCode()}</p>
        </div>
    );

}