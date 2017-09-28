package com.ivant.spyfall;

import java.io.IOException;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.atomic.AtomicInteger;

import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;

import com.ivant.util.HTMLFilter;

/**
 *
 */

/**
 * @author Anthony Joseph Gal
 *
 * @version 1.0 Sep 27, 2017
 * @since 1.0 Sep 27, 2017
 *
 */

@ServerEndpoint(value = "/spyfall/{name}")
public class SpyFallConnection {

	private static final String GUEST_PREFIX = "Guest";
    private static final AtomicInteger connectionIds = new AtomicInteger(0);
    private static final Set<SpyFallConnection> connections =
            new CopyOnWriteArraySet<SpyFallConnection>();
	
    private volatile String nickname;
    private Session session;
    private int voteCount = 0;
    
    private static final String GET_PLAYERS = "-players";
    private static final String START_GAME = "-start";
    private static final int MIN_PLAYERS = 3;
    
    private static final String[] LOCATIONS = {
	    	"Airplane",
			"Beer House",
			"Car",
			"Casino",
			"Church",
			"Factory",
			"Forest",
			"Hospital",
			"Mall",
			"Market",
			"Motel",
			"Park",
			"Pirate Ship",
			"Prison",
			"Restaurant",
			"Train",
			"School"
    	};

    public SpyFallConnection() {
    	nickname = GUEST_PREFIX + connectionIds.getAndIncrement();
    }
    
    @OnOpen
	public void start(@PathParam("name") String name, Session session) {
		this.session = session;
		this.nickname = name;
		if (findByName(nickname) == null) {
			connections.add(this);
			String message = String.format("* %s %s", nickname, "has joined.");
			broadcast(message);
		}else{
			String message = String.format("* %s %s", nickname, "already in use.");
			try {
				this.session.getBasicRemote().sendText(message);
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}

    @OnClose
    public void end() {
    	if(connections.contains(this)){
    		  connections.remove(this);
    	        String message = String.format("* %s %s",
    	                nickname, "has disconnected.");
    	        broadcast(message);
    	}else{
    		System.out.println("Connection not valid");
    	}
    }

    @OnMessage
    public void incoming(String message) {
    	String m = HTMLFilter.filter(message.toString());
    	if (START_GAME.equals(m)) {
			if (connections.size() >= MIN_PLAYERS) {
    			int spy = getSpy();
        		int location = getLocation();
//        		System.out.println("spy: " + spy + " | location: " + location);
        		startGame(spy, location);
        		return;
    		}else{
				message = "Need at least " + MIN_PLAYERS + " players to start the game.";
    			broadcast(message);
    			return;
    		}
    		
    	}
    	if (GET_PLAYERS.equals(m)) {
    		message = "Current online: " + getPlayers();
    	}
        // Never trust the client
        String filteredMessage = String.format("%s: %s",
                nickname, HTMLFilter.filter(message.toString()));
    	broadcast(filteredMessage);
    }

    @OnError
    public void onError(Throwable t) throws Throwable {
        System.out.println("Chat Error: " + t.toString() + "\n" + t.getMessage());
    }
    
    private static SpyFallConnection findByName(String name) {
    	for (SpyFallConnection client : connections) {
    		synchronized (client) {
    			if (client.nickname.equalsIgnoreCase(name)) {
    				return client;
    			}
    		}
    	}
    	return null;
    }

    private static void broadcast(String msg) {
        for (SpyFallConnection client : connections) {
            try {
                synchronized (client) {
                    client.session.getBasicRemote().sendText(msg);
                }
            } catch (IOException e) {
                System.out.println("Chat Error: Failed to send message to client:\n" + e.getMessage());
                connections.remove(client);
                try {
                    client.session.close();
                } catch (IOException e1) {
                    // Ignore
                }
                String message = String.format("* %s %s",
                        client.nickname, "has been disconnected.");
                broadcast(message);
            }
        }
    }
    
    private static String getPlayers() {
    	StringBuilder players = new StringBuilder();
    	for (SpyFallConnection client : connections) {
    		synchronized (client) {
    			players.append(client.nickname).append(", ");
    		}
    	}
    	return players.toString();
    }
    
    private static int getSpy() {
    	int max = connections.size();
    	Random random = new Random();
    	return random.nextInt(max);
    }
    
    private static int getLocation() {
    	int max = LOCATIONS.length;
    	Random random = new Random();
    	return random.nextInt(max);
    }
    
    private static void startGame(int spy, int location) {
    	try {
    		int clientIndex = 0;
    		String gameStart = "-=GAME START=-<br />";
    		boolean sentToSpy = false;
    		int locationSentCount = 0;
    		String finalMessage = "";
    		for (SpyFallConnection client : connections) {
    			synchronized (client) {
    				if (clientIndex == spy) {
    					client.session.getBasicRemote().sendText(gameStart + "You are the SPY... :)");
    					sentToSpy = true;
    				} else {
    					client.session.getBasicRemote().sendText(gameStart + "Secret location: " + LOCATIONS[location]);
    					locationSentCount++;
    				}
    				clientIndex++;
                }
    		}
    		if (sentToSpy) {
    			finalMessage = finalMessage + "One of you is the SPY.<br />";
    		}
    		finalMessage = finalMessage + "The Secret Location was sent to " + locationSentCount + " players.";
    		broadcast(finalMessage);
    		
    	} catch(Exception e) {
    		broadcast("THERE IS AN ERROR STARTING THE GAME!");
    	}
    }
}
