@php $title = "Support Ticket"; $atitle ="support";
@endphp
@include('layouts.headercss')

<section class="Dashboard-page">
	<div class="container-fluid">
		<div class="row">

			@include('layouts.menu')


			<div class="col-lg-10 col-xl-10 col-md-12 col-sm-12 col-xs-12">

				<div class="header-part-outer">

					<div class="head-title-part">
						<h1>Support</h1>
					</div>

				</div>

				<div class="support-card">
					@if ($message = Session::get('ticketsuccess'))
					<div class="alert alert-success alert-block">
						<button type="button" class="close" data-dismiss="alert">×</button> 
						<strong>{{ $message }}</strong>
					</div>
					@endif


					@if ($message = Session::get('fail'))
					<div class="alert alert-warning alert-block">
						<button type="button" class="close" data-dismiss="alert">×</button> 
						<strong>{{ $message }}</strong>
					</div>
					@endif
				<div class="flexbox supportbg">
					<div class="panelcontentbox supportticketlist">
						<h1 class="heading-box">Ticket List</h1>
						<div class="tabrightbox"> <a href="#" class="btn sitebtn btn-sm" data-bs-toggle="modal" data-bs-target="#ticket" href="#ticket"><i class="fa fa-plus"></i></a> </div>
						<div class="supportsearch">
							<form class="siteformbg" action="{{url('ticket-search')}}" method="post" autocomplete="off">
								@csrf
								<div class="form-group">
									<div class="input-group">
										<input type="text" name="ticket_id" class="form-control" placeholder="Search Ticket ID" value="{{$search}}"/>
										<div class="input-group-append">
											<button type="submit" name="" class="input-group-text"><i class="fa fa-search"></i></button>
											<a class="input-group-text" href="{{('support')}}" ><i class="fa fa-undo"></i></a>
										</div>
									</div>
								</div>
							</form>
						</div>
						<div class="supportlist" data-simplebar>
							<ul class="nav nav-tabs tabbanner" role="tablist">
								@forelse($support_ticket as $support_tickets)
								<li class="nav-item">
									<a class="nav-link @if($support_tickets->ticket_id == $ticket_id) active @endif"  href="{{url('support-ticket/'.$support_tickets->ticket_id)}}">
										<p>Ticket Id : <span>{{ $support_tickets->ticket_id }}</span></p>
										<p class="">Title : <span class="">{{ $support_tickets->subject }}</span></p>
										<p class="datetext">{{ date('M d, Y', strtotime($support_tickets->created_at)) }}</p>
									</a>
								</li>
								@empty
								<li class="nav-item">
									<a class="nav-link" data-toggle="tab" data-bs-target="#chat2" data-bs-toggle="tab" href="#chat2">
										<p>No record found!</p>
									</a>
								</li>
								@endforelse
							</ul>
						</div>
					</div>
					<div class="panelcontentbox chatticketlist">
						<h1 class="heading-box">Chat</h1> <span class="ticktmenuicon"><i class="fa fa-close"></i></span>
						<div class="tab-content">
							@if(count($chats) > 0)
							<div id="chat1" class="tab-pane fade in show active">
								<div class="chatbox ticketchat">									
									<ul class="chat chatboxscroll" data-simplebar>
										@forelse($chats as $chat)
										@if($chat->reply)
										<li class="left clearfix">
											<div class="chat-img pull-left"><img src="{{ url('images/profile.svg') }}" class="img-circle"></div>
											<div class="chat-body clearfix">
												<div class="header">
													<h4 class="primary-font">Admin</h4>
													<p>{{ $chat->reply }}</p>
													<h5><i class="fa fa-calendar" aria-hidden="true"></i> {{ humanTiming(strtotime($chat->created_at)) }} ago</h5></div>
											</div>
										</li>
										@else
										<li class="right clearfix">
											<div class="chat-body clearfix">
												<div class="header">
													<h4 class="primary-font">{{ $user->name }}</h4>
													<p>{{ $chat->message }}</p>
													<h5><i class="fa fa-calendar" aria-hidden="true"></i> {{ humanTiming(strtotime($chat->created_at)) }} ago</h5></div>
											</div>
											<div class="chat-img pull-right"><img src="{{ url('images/profile.svg') }}" class="img-circle"></div>
										</li>
										@endif
										@empty
										<li class="left clearfix">
											<div class="chat-img pull-left"><img src="images/profile.svg" class="img-circle"></div>
											<div class="chat-body clearfix">
												<div class="header">
													<h4 class="primary-font">John</h4>
													<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
													<h5><i class="fa fa-calendar" aria-hidden="true"></i>  ago</h5></div>
											</div>
										</li>
										<li class="right clearfix">
											<div class="chat-body clearfix">
												<div class="header">
													<h4 class="primary-font">John</h4>
													<p>Curabitur bibendum ornare dolor, quis ullamcorper ligula sodales.</p>
													<h5><i class="fa fa-calendar" aria-hidden="true"></i> Mar 18, 2020</h5></div>
											</div>
											<div class="chat-img pull-right"><img src="images/profile.svg" class="img-circle"></div>
										</li>
										<li class="right clearfix">
											<div class="chat-body clearfix">
												<div class="header">
													<h4 class="primary-font">John</h4>
													<p>Curabitur bibendum ornare dolor, quis ullamcorper ligula sodales.</p>
													<h5><i class="fa fa-calendar" aria-hidden="true"></i> Mar 18, 2020</h5></div>
											</div>
											<div class="chat-img pull-right"><img src="images/profile.svg" class="img-circle"></div>
										</li>
										@endforelse									
									</ul>
									<div class="chat-foot">
										<form class="siteformbg row mt-3" id="chatformid" method="post">
										{{ csrf_field() }}
										<input type="hidden" name="ticket_id" id="ticket_id" value="{{ $ticket_id }}">
											<div class="form-group col-md-9 col-sm-12">
												<textarea class="form-control" rows="2"  name="message" id="message" placeholder="Enter your message"></textarea>
												<p id="msg" style="display: none;" class="alert alert-success alert-dismissible text-center"></p>
												<p id="errormsg" style="display: none;" class="alert alert-danger alert-dismissible text-center">Message Field required</p>
											</div>
											<div class="form-group text-center col-md-3 col-sm-12">
												<button  id="chatmessage" class="btn sitebtn"  />SEND </button></div>
												
										</form>
									</div>
								</div>
							</div>
							@else
							<div id="chat1" class="tab-pane fade in show active">
								<div class="chatbox ticketchat">
									<p>No chat found!</p>
								</div>
							</div>
							@endif
						</div>
					</div>
				</div>
			</div>
		</article>


</div>
<div class="modal fade modalbgt" id="ticket">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">Create Ticket</h4>
        <button type="button" class="close" data-bs-dismiss="modal">&times;</button>
      </div>
      <div class="modal-body">
			<form class="siteformbg" action="{{ url('submitNewTicket') }}" id="theform" method="post" autocomplete="off">
				@csrf
				<div class="form-group">
					<label>Title</label>
					<input type="text" name="subject" class="form-control @error('subject') is-invalid @enderror" required="required">
					@error('subject')
						<span class="invalid-feedback" role="alert">
							<strong>{{ $message }}</strong>
						</span>
					@enderror 
				</div>
				<div class="form-group">
					<label>Enter your message</label>
					<textarea rows="3" class="form-control @error('subject') is-invalid @enderror" name="message" required="required"></textarea>
					@error('message')
						<span class="invalid-feedback" role="alert">
							<strong>{{ $message }}</strong>
						</span>
					@enderror 
				</div>
				<div class="form-group mt-2 text-center">
					<input type="submit" class="btn sitebtn" value="Submit" />
				</div>	
			</form>
      </div>      
    </div>
  </div>
</div>
<script>
$(".supportticketlist .tabbanner li a").click(function(a) 
{
	  $(".supportbg").addClass("supportlistshow");
});
$(".chatticketlist .ticktmenuicon .fa-close").click(function(a) 
{
	  $(".supportbg").removeClass("supportlistshow");
});
</script>
<script>
@php $uid = \Crypt::encrypt(Auth::user()->id); @endphp

$(document).ready(function(){

	$("#chatmessage").click(function(){

		$('#chatmessage').hide();
		setInterval(function(){ $('#chatmessage').show(); }, 3000);


	
//var websocket = new WebSocket("ws://localhost:9091");  
		var ticket_id = $('#ticket_id').val();
		var message = $('#message').val();

		if(message == "")
		{
			$('#errormsg').show();

			return false;
		}

    $.ajax({
       type:'POST',
       url: "{{ url('/sendMessage') }}",
       data:$("#chatformid").serialize(),
       success:function(data) {
       	$("#msg").show();
          $("#msg").html(data.message);
          $('#message').val('');
          location.reload();
		
		/*var messageJSON = {
		_token: "{{ $uid }}",
		ticket_id: "{{ $ticket_id }}"
		};
		websocket.send(JSON.stringify(messageJSON));*/

       }
    });

		

    });
});


/*$(document).ready(function(){
var websocket = new WebSocket("ws://localhost:9091");  
websocket.onopen = function(event) {
var messageJSON = {
_token: "{{ $uid }}",
ticket_id: "{{ $ticket_id }}"
};
websocket.send(JSON.stringify(messageJSON));
}
websocket.onmessage = function(event) {
var Data = JSON.parse(event.data);
console.log(Data.message);

$('#messagediv').html(Data.message);

};

websocket.onerror = function(event){
console.log("Problem due to some Error");
};
websocket.onclose = function(event){
console.log("Connection Closed");
};
});*/
</script>