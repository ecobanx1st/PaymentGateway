<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Models\User;
use App\Models\TicketChat;
use App\Models\Tickets;

class TicketSentUser extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

     /**
     * The contact instance.
     *
     * @var Contact
     */
    protected $ticketId;
    protected $userid;
    protected $ticketChat;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($ticketId, $userid, $ticketChat)
    {
        $this->ticketId = $ticketId;
        $this->userid = $userid;
        $this->ticketChat = $ticketChat;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $user = User::where('id', $this->userid)->first(); 

        $ticket = Tickets::where('ticket_id', $this->ticketId)->first();
                
        return $this->markdown('email.ticket-sent-user')
                    ->with([
                        'username' => $user->name,
                        'userEmail' => $user->email,
                        'referenceNo' => $ticket->ticket_id,
                        'chat_id' => $ticket->ticket_id,
                        'message' => $this->ticketChat->reply,
                  
                    ]);
    }
}
