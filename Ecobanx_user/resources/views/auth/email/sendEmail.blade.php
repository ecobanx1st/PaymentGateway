@include('email.header')
<tr><td align='left'>&nbsp;</td><td style='text-align:center;font-size:20px;color:#515151;font-weight:600;'>Welcome to {{ config('app.name') }}</td><td align='left'>&nbsp;</td></tr>
<tr><td colspan='3' align='center' height='1' style='padding:0px;'></td></tr>
<tr><td align='left' style='padding-top:0px;'>&nbsp;</td><td style='text-align:left;font-size:15px;color:#000;padding-top:0px;'>Hello  {{ $user->first_name }} {{ $user->last_name }},</td><td align='left' style='padding-top:0px;'>&nbsp;</td></tr>
<tr><td colspan='3' align='center' height='1' style='padding:0px;'></td></tr>
<tr><td align='left' style='padding-top:0px;'>&nbsp;</td><td style='text-align:left;font-size:15px;color:#000;padding-top:0px;'>Please click on the link below to verify your email ID.
</td><td align='left' style='padding-top:0px;'>&nbsp;</td></tr>
<tr><td colspan='3' align='center' height='30' style='padding:0px;'></td></tr>
<tr><td align='center'>&nbsp;</td><td align='center'><a href="{{route('sendEmailDone', ['email' => \Crypt::encryptString($user->email), 'verifyToken' => $user->id])}}" style='color:#fff;padding:14px 22px;text-decoration:none;background-color:#0974FF;text-transform:uppercase;font-size:15px;font-weight:600;'>Click to Verify</a></td><td align='center'>&nbsp;</td></tr>
<tr><td colspan='3' align='center' height='30' style='padding:0px;'></td></tr>


@include('email.footer')