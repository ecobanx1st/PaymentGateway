@include('inc.header')
@section('title', 'Ticket Lists | Coinbanker - crypto exchange & trading platform')

<div class="inner-header innerpagehead">
@include('inc.menu')
</div>
</header>

<article>
<div class="pagecontent inner-pagecnt">
<section class="">
		<div class="container site-container">
			<div class="content-section">
<div id="content-wrapper">
      <div class="mui--appbar-height"></div>
      <div class="mui-container-fluid">
      <br><br>
	  
		  <div class="row">
				<div class="mui-col-md-12">
					<div class="mui-panel panel-m"><h3 class="mb-4 upper mt-0 mb-0 b-f">
					{{ __('common.create_ticket') }}</h3>
				</div>
			</div>
		  </div>
		  
      <div class="row">
		<div class="col-md-12 col-sm-12 col-xs-12"> 
			 <div class="mui-panel panel-m">
						<form class="mui-form mui-f" method="POST" action="{{ url('myaccount/tickets/save') }}">
							{{ csrf_field() }}
							 <div class="row">
							 <div class="col-md-5 col-sm-8 col-xs-12 mt-10">
							 <div class="mui-textfield mb-20">
								<input type="text" name="subject" required="required">
								<label>{{ __('common.Ticket_Name') }}/ {{ __('common.Subject') }}</label>
							  </div>
							  </div>
							  </div>
							  
							   <div class="row">
							 <div class="col-md-5 col-sm-8 col-xs-12">
							 <div class="mui-textfield mb-20">
								<textarea class="textsize" required="required" name="message"></textarea>
								<label>{{ __('common.Message') }}</label>
							  </div>
							  </div>
							  </div>
							  
							 
								 <div class="row pt-10">
								 <div class="col-md-4">
								<button type="submit" class="mui-btn mui-btn--primary radius-btn green-btn">{{ __('common.submit') }}</button>
								</div>
								</div>
							</form>
					</div>
				</div>
			</div>
					

</div>	
</div>
  </div>
	  </div>
	</div>
</section>
</article>
	  
<!--footer-->	  
@include('inc.footer')
