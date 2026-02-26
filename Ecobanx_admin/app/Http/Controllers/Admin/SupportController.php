<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\TicketSentUser;
use App\Models\TicketChat;
use App\Models\Tickets;
use App\Models\User;
use Illuminate\Http\Request;

class SupportController extends Controller
{
    public function __construct()
    {
        $this->middleware('admin');
    }

    public function index(Request $request, $search = null)
    {

        if (isset($search) && (! isset($request->searchphrase) && ! isset($request->datefilter))) {
            return back()->with('status', "Please enter search phrase!");
        }

        $search     = $request->searchphrase;
        $dateFilter = $request->datefilter;

        $support = Tickets::join('users', 'supporttickets.uid', '=', 'users.id')
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('supporttickets.ticket_id', 'like', "%$search%")
                        ->orWhere('users.name', 'like', "%$search%");
                });
            })
            ->when($dateFilter, function ($q) use ($dateFilter) {
                $q->whereDate('supporttickets.created_at', '=', $dateFilter);
            })
            ->select('supporttickets.*', 'users.name')
            ->orderBy('supporttickets.id', 'desc')
            ->paginate(10);

        return view('support.list', ['tickets' => $support, 'search' => $search, 'dateFilter' => $dateFilter]);
    }

    public function reply($id)
    {
        $id     = \Crypt::decrypt($id);
        $ticket = Tickets::on('mysql2')->where('id', $id)->first();
        if (! is_object($ticket)) {
            return back()->with('status', "Invalid ticket!");
        }
        $chatlist = TicketChat::on('mysql2')->where('ticketid', $ticket->ticket_id)->get();
        TicketChat::where('ticketid', $ticket->ticket_id)->update(['admin_status' => 1]);

        $userid   = $ticket->uid;
        $userlist = User::where('id', $userid)->first();

        return view('support.reply', [
            'chatlist' => $chatlist,
            'username' => $userlist->name,
            'userlist' => $userlist,
        ]);
    }

    public function adminsavechat(Request $request)
    {

        $message = $request->message;
        $chat_id = $request->chat_id;
        $userid  = $request->userid;
        $ticket  = Tickets::on('mysql2')->where('ticket_id', $chat_id)->first();
        if (! is_object($ticket)) {
            return back()->with('status', "Invalid ticket!");
        }
        if ($message != "" && $chat_id != "" && $userid != "") {

            $ticketChat               = new TicketChat;
            $ticketChat->uid          = $userid;
            $ticketChat->ticketid     = $chat_id;
            $ticketChat->message      = null;
            $ticketChat->reply        = $message;
            $ticketChat->user_status  = 0;
            $ticketChat->admin_status = 1;

            if ($ticketChat->save()) {
                dd(5);
                TicketChat::where('ticketid', $chat_id)->update(['admin_status' => 1]);
                $userEmail = User::where('id', $userid)->first();
                $email     = $userEmail->email;
                \Mail::to($email)->queue(new TicketSentUser($chat_id, $userid, $ticketChat));
                $data['msg'] = 'success';
            } else {
                $data['msg'] = 'fail';
            }
        } else {
            $data['msg'] = 'required';
        }
        return json_encode($data);

    }
}
