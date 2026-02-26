@include('email.header')
<tr><td colspan='3' align='center' height='1' style='padding:0px;'></td></tr>
<tr><td align='left' style='padding-top:0px;'>&nbsp;</td><td style='text-align:left;font-size:15px;color:#000;padding-top:0px;'>Hello  {{ $user->first_name }} {{ $user->last_name }},</td><td align='left' style='padding-top:0px;'>&nbsp;</td></tr>
<tr><td colspan='3' align='center' height='1' style='padding:0px;'></td></tr>
<tr><td align='left' style='padding-top:0px;'>&nbsp;</td><td style='text-align:left;font-size:15px;color:#000;padding-top:0px;'>KYC is being processed.
</td><td align='left' style='padding-top:0px;'>&nbsp;</td></tr>
<tr><td align='left' style='padding-top:0px;'>&nbsp;</td><td style='text-align:left;font-size:15px;color:#000;padding-top:0px;'>This is a quick email to let you know that we’ve received your KYC details and are currently processing it for verification. We’ll email you once the verification has been completed.
</td><td align='left' style='padding-top:0px;'>&nbsp;</td></tr>
<tr><td align='left' style='padding-top:0px;'>&nbsp;</td><td style='text-align:left;font-size:15px;color:#000;padding-top:0px;'>You don't have to do anything for now.
</td><td align='left' style='padding-top:0px;'>&nbsp;</td></tr>
<tr><td colspan='3' align='center' height='30' style='padding:0px;'></td></tr>


@include('email.footer')