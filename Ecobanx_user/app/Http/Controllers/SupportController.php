<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Crypt;
use App\User;
use App\Models\Commission;
use App\Models\Supportticket;
use App\Models\Supportchat;
use Auth;
use Validator;

class SupportController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth']);
    }

   	public function supportView($ticket_id=null)
   	{
   		$user = Auth::user();
		if($ticket_id){
			$ticket_id = strtoupper(seoUrl($ticket_id));
			$is_valid = Supportticket::where(['uid' =>  $user->id, 'ticket_id' => $ticket_id])->first();
			if(!is_object($is_valid)){
				return abort(404);
			}
		}
   		$tickets = Supportticket::where('uid', $user->id)->orderBy('id','desc')->paginate(15);		
		if(!$ticket_id && count($tickets) > 0){
			$ticket_id = $tickets[0]['ticket_id'];
		}
   		$chats = Supportchat::where([['uid', '=', $user->id], ['ticketid', '=', $ticket_id]])->get();
   		return view('userpanel.ticket.list', ['user' => $user,'search'=>" ", 'support_ticket' => $tickets, 'chats' => $chats,'ticket_id' => $ticket_id]);
   	}

   public function Ticketcreate()
   	{
   		
   		return view('/userpanel/ticket');
   	}
   	
   	public function newticket()
   	{
   		$user = Auth::user();
	    $tickets = Supportticket::where('uid', $user->id)->orderBy('id','desc')->paginate(15);
		$ticket_count = Supportchat::where([['uid', '=', $user->id], ['user_status', '=', '0']])->count();
   	    return view('/userpanel/newticket', ['user' => $user, 'ticket_count' => $ticket_count]);
   	}

   	public function submitNewTicket(Request $request)
	{
		$user = Auth::user();
		$this->validate($request, [
			'subject' => 'required| regex:/(^[A-Za-z0-9 ]+$)+/',
			'message' => 'required| regex:/(^[A-Za-z0-9 ]+$)+/'
		]);

		$ticket_id = "WXP".rand(1000000, 99999999);

		$new_ticket = new Supportticket();
		$new_ticket->uid = $user->id;
		$new_ticket->ticket_id = $ticket_id;
		$new_ticket->subject = $request->subject;
		$new_ticket->message = $request->message;
		$new_ticket->status = 0;
		$save_record = $new_ticket->save();
		if($save_record)
		{
			$chat_msg = new Supportchat();
			$chat_msg->uid = $user->id;
			$chat_msg->ticketid = $ticket_id;
			$chat_msg->message = $request->message;
			$chat_msg->reply = NULL;
			$chat_msg->user_status = 1;
			$chat_msg->admin_status = 0;
			$chat_msg->save();
            return redirect('/support');
		}
	}
	
	public function viewTicket(Request $request)
	{
		$user = Auth::user();
		$ticket_id = Crypt::decrypt($request->id);
		$user_support = Supportticket::where('uid', $user->id)->get();
		$tickets = Supportticket::where('uid', $user->id)->orderBy('id','desc')->paginate(15);
		$ticket_count = Supportchat::where([['uid', '=', $user->id], ['user_status', '=', '0']])->count();
		if($ticket_id && $ticket_id!='')
		{
			$user_support = Supportchat::where('ticketid', $ticket_id)->get();
			$update = Supportchat::where('ticketid', $ticket_id)->update(['user_status' => 1]);
			if($user_support && $user_support->count() > 0)
			{
				return view('userpanel/chat', ['ticket_id' => $ticket_id, 'user' => $user, 'support_data' => $user_support, 'ticket_id' => $ticket_id, 'ticket_count' => $ticket_count]);
			}
		}
		else
		{
			return view('userpanel/chat', ['ticket_id' => $ticket_id, 'user' => $user, 'support_data' => $user_support, 'ticket_id' => $ticket_id, 'ticket_count' => $ticket_count]);
		}
	}
	
	public function sendMessage(Request $request)
	{

		//dd($request);
		$user = Auth::user();
		
		$validator = Validator::make($request->all(), [
			'ticket_id' => 'required| regex:/(^[A-Za-z0-9 ]+$)+/',
			'message' => 'required| regex:/(^[A-Za-z0-9 ]+$)+/'
		]);


		if ($validator->fails()) { 
        return response()->json(["error" => false,'result' => NULL,'message'=> $validator->errors()->first()], 401);           
        }


		$chat_msg = new Supportchat();
		$chat_msg->uid = $user->id;
		$chat_msg->ticketid = $request->ticket_id;
		$chat_msg->message = $request->message;
		$chat_msg->reply = NULL;
		$chat_msg->user_status = 1;
		$chat_msg->admin_status = 0;
		$chat_msg->save();

		$support_data = '';
		$user_support = Supportticket::where('uid', $user->id)->get();
		if($user_support && $user_support->count() > 0)
		{
			$support_data = $user_support;
		}
		$ticket_id = Crypt::encrypt($request->ticket_id);


		$res =__('message.MessagesendSuccessfully');
		 return response()->json(["success" => true,'result' => null,'message'=> $res]);
	}

	public function searchTicket(Request $request)
	{
     $validator=Validator::make($request->all(),[
		'ticket_id'=>'required| regex:/(^[A-Za-z0-9 ]+$)+/'
	 ]);
     $user=Auth::user();
	 $ticket_id=$request->ticket_id;
	 
	 $support_ticket = Supportticket::where('ticket_id', $ticket_id)->get();	
	 	 
	 $chats = Supportchat::where([['uid',$user->id], ['ticketid', $ticket_id]])->get();
	 //for search box input remain until reset

	 $search =$request->ticket_id;
	 return view('support', ['user' => $user, 'search'=>$search, 'support_ticket' => $support_ticket, 'chats' => $chats,'ticket_id' => $ticket_id]);

	}
}
