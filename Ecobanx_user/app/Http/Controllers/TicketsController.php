<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use App\Models\Supportticket;
use App\Models\Supportchat;
use Illuminate\Support\Facades\Mail;
use App\Mail\TicketSentAdmin;
use App\Models\Admin;
use App\User;

class TicketsController extends Controller
{
  
    public function __construct()
    {
       $this->middleware(['auth']);
    }

    public function index()
    {     

        $ticketLists = Supportticket::where('uid', Auth::id())->orderBy('id', 'DESC')->paginate(20);
        $userid = User::where('id', Auth::id())->first();
    

        return view('/userpanel.ticket.list', [

                'ticketLists' => $ticketLists,
                'verfiyid' => $userid
        ]);

    }

    public function create()
    {     

        return view('/userpanel.ticket.create');

    }

    public function store(Request $request)
    {
        
        
        if($request->subject !="")
        {
        $ticket = new Supportticket;
        $ticket->ticket_id = 'BB'.rand(100000, 9999999);
        $ticket->subject = $request->subject;
        $ticket->uid = \Auth::id();
        if ($ticket->save())
        {
            $ticketChat = new Supportchat;
            $ticketChat->uid = \Auth::id();
            $ticketChat->ticketid = $ticket->id;
            $ticketChat->message = $request->message;
            $ticketChat->user_status = 1;
            if ($ticketChat->save())
            {
                $adminEmail = Admin::where('id', 1)->pluck('email');
                 Mail::to($adminEmail[0])->queue(new TicketSentAdmin($ticket, $ticketChat));
                \Session::flash('ticketsuccess', 'Ticket created successfully.');                
            }
            else
            {
                \Session::flash('fail', 'Ticket created failed!!!.'); 

            }

        }
        else
        {
            \Session::flash('fail', 'Ticket created failed!!!.'); 
        }

             return Redirect::to('/tickets/list');
        }
        else
        {
           \Session::flash('fail', 'Ticket created failed!!!.'); 
            return Redirect::to('/tickets/list');
        }
    }

      public function reply($id)
    {     

        $uid= Auth::id();
        $chatlist= Supportchat::where('ticketid',$id)->get();
        Supportchat::where('ticketid',$id)->update(['user_status' => 1]);
        return view('/userpanel.ticket.reply', [
        'chatlist' => $chatlist
        ]);


    }
    
    public function usersavechat(Request $request)
    {
   
        $message     = $request->message;
        $chat_id     = $request->chat_id;
        $userid       = $request->userid; 

        if($message !="" && $chat_id !="" && $userid !="" )
        {

               Supportchat::where('ticketid',$chat_id)->update(['user_status' => 1]);
                $insert = array(
                'ticketid'         => $chat_id,
                'uid'       => $userid,
                'message'       => $message,
                'reply'         => NULL,
                'user_status' => 1,
                'created_at'        => date('Y-m-d H:i:s',time())
                );
                $chati = Supportchat::insert($insert);

                if ($chati)
                {
                $data['msg'] = 'success';

                }
                else
                {
                $data['msg'] = 'fail';
                }
        }
        else
            {
                $data['msg'] = 'required';
            }


        
         return json_encode($data);
    }
 

}
